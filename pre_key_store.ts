interface PreKeyStore {
  loadPreKey(keyId: number): Promise<PreKeyRecord | undefined>;
  storePreKey(keyId: number, preKeyRecord: PreKeyRecord): Promise<void>;
  removePreKey(keyId: number): Promise<void>;
}

// Compléter l'implémentation de MyPreKeyStore
class MyPreKeyStore implements PreKeyStore {
  private secureStorage: SecureKeyStore;
  
  constructor(secureStorage: SecureKeyStore) {
    this.secureStorage = secureStorage;
  }
  
  async loadPreKey(keyId: number): Promise<PreKeyRecord | undefined> {
    const serialized = await this.secureStorage.getEncryptedData(`preKey:${keyId}`);
    if (!serialized) {
      return undefined;
    }
    return PreKeyRecord.deserialize(Buffer.from(serialized, 'base64'));
  }
  
  async storePreKey(keyId: number, preKeyRecord: PreKeyRecord): Promise<void> {
    await this.secureStorage.storeEncryptedData(
      `preKey:${keyId}`, 
      Buffer.from(preKeyRecord.serialize()).toString('base64')
    );
  }
  
  async removePreKey(keyId: number): Promise<void> {
    await this.secureStorage.deleteEncryptedData(`preKey:${keyId}`);
  }
  
  // Méthode additionnelle pour obtenir tous les IDs des PreKeys stockées
  async getAllPreKeyIds(): Promise<number[]> {
    const allKeys = await this.secureStorage.getAllKeys();
    return allKeys
      .filter(key => key.startsWith('preKey:'))
      .map(key => parseInt(key.replace('preKey:', ''), 10));
  }
}