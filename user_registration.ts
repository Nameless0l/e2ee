async function registerUser(userId: string): Promise<UserKeys> {
  // 1. Générer les clés d'identité
  const identityKeyPair = await generateIdentityKeyPair();
  const registrationId = await generateRegistrationId();
  
  // 2. Générer des clés préchargées (ex: 100)
  const preKeys = await generatePreKeys(1, 100);
  
  // 3. Générer une clé préchargée signée
  const signedPreKey = await generateSignedPreKey(identityKeyPair, 1);
  
  // 4. Stocker localement les clés privées
  await myIdentityKeyStore.storeIdentityKeyPair(identityKeyPair);
  await myIdentityKeyStore.storeLocalRegistrationId(registrationId);
  
  for (const preKey of preKeys) {
    await myPreKeyStore.storePreKey(preKey.id, preKey);
  }
  
  await mySignedPreKeyStore.storeSignedPreKey(signedPreKey.id, signedPreKey);
  
  // 5. Envoyer les clés publiques au serveur
  return {
    identityKey: identityKeyPair.pubKey,
    registrationId,
    preKeys: preKeys.map(pk => ({ id: pk.id, key: pk.getPublicKey() })),
    signedPreKey: {
      id: signedPreKey.id,
      key: signedPreKey.getPublicKey(),
      signature: signedPreKey.getSignature()
    }
  };
}