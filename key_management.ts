class KeyManager {
  private static PREKEY_MINIMUM_COUNT = 20;
  private static PREKEY_BATCH_SIZE = 100;
  private static SIGNED_PREKEY_ROTATION_INTERVAL_DAYS = 7;
  
  // Vérifier et regénérer des préclés si nécessaire
  async checkAndReplenishPreKeys(): Promise<void> {
    // Compter les préclés restantes sur le serveur
    const remainingPreKeyCount = await this.countRemainingPreKeys();
    
    if (remainingPreKeyCount < KeyManager.PREKEY_MINIMUM_COUNT) {
      // Besoin de générer de nouvelles préclés
      const lastPreKeyId = await this.getLastPreKeyId();
      const startId = lastPreKeyId + 1;
      
      // Générer un nouveau lot de préclés
      const newPreKeys = await generatePreKeys(startId, KeyManager.PREKEY_BATCH_SIZE);
      
      // Stocker localement
      for (const preKey of newPreKeys) {
        await myPreKeyStore.storePreKey(preKey.id, preKey);
      }
      
      // Envoyer au serveur
      await this.uploadPreKeys(newPreKeys.map(pk => ({
        id: pk.id,
        key: pk.getPublicKey()
      })));
    }
  }
  
  // Rotation périodique des clés signées
  async rotateSignedPreKeyIfNeeded(): Promise<void> {
    const currentSignedPreKeyId = await this.getCurrentSignedPreKeyId();
    const lastRotationTimestamp = await this.getLastSignedPreKeyRotationTimestamp();
    
    const now = Date.now();
    const rotationIntervalMs = KeyManager.SIGNED_PREKEY_ROTATION_INTERVAL_DAYS * 24 * 60 * 60 * 1000;
    
    if (!lastRotationTimestamp || (now - lastRotationTimestamp > rotationIntervalMs)) {
      // Besoin de faire une rotation
      const identityKeyPair = await myIdentityKeyStore.getIdentityKeyPair();
      const newSignedPreKeyId = currentSignedPreKeyId + 1;
      
      // Générer une nouvelle clé préchargée signée
      const newSignedPreKey = await generateSignedPreKey(identityKeyPair, newSignedPreKeyId);
      
      // Stocker localement
      await mySignedPreKeyStore.storeSignedPreKey(newSignedPreKeyId, newSignedPreKey);
      
      // Envoyer au serveur
      await this.uploadSignedPreKey({
        id: newSignedPreKeyId,
        key: newSignedPreKey.getPublicKey(),
        signature: newSignedPreKey.getSignature()
      });
      
      // Mettre à jour l'horodatage de la dernière rotation
      await this.setLastSignedPreKeyRotationTimestamp(now);
      await this.setCurrentSignedPreKeyId(newSignedPreKeyId);
      
      // Optionnel : supprimer les anciennes clés signées après une certaine période
      const twoRotationsAgoId = newSignedPreKeyId - 2;
      if (twoRotationsAgoId > 0) {
        await mySignedPreKeyStore.removeSignedPreKey(twoRotationsAgoId);
      }
    }
  }
}