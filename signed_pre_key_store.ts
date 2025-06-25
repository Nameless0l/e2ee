interface SignedPreKeyStore {
  loadSignedPreKey(keyId: number): Promise<SignedPreKeyRecord | undefined>;
  storeSignedPreKey(keyId: number, record: SignedPreKeyRecord): Promise<void>;
  removeSignedPreKey(keyId: number): Promise<void>;
}

// Compléter l'implémentation de MySignedPreKeyStore
class MySignedPreKeyStore implements SignedPreKeyStore {
  private secureStorage: SecureKeyStore;
  
  constructor(secureStorage: SecureKeyStore) {
    this.secureStorage = secureStorage;
  }
  
  async loadSignedPreKey(keyId: number): Promise<SignedPreKeyRecord | undefined> {
    const serialized = await this.secureStorage.getEncryptedData(`signedPreKey:${keyId}`);
    if (!serialized) {
      return undefined;
    }
    return SignedPreKeyRecord.deserialize(Buffer.from(serialized, 'base64'));
  }
  
  async storeSignedPreKey(keyId: number, record: SignedPreKeyRecord): Promise<void> {
    await this.secureStorage.storeEncryptedData(
      `signedPreKey:${keyId}`, 
      Buffer.from(record.serialize()).toString('base64')
    );
  }
  
  async removeSignedPreKey(keyId: number): Promise<void> {
    await this.secureStorage.deleteEncryptedData(`signedPreKey:${keyId}`);
  }
  
  // Méthode pour obtenir la clé signée la plus récente
  async getLatestSignedPreKey(): Promise<{id: number, record: SignedPreKeyRecord} | null> {
    const allKeys = await this.secureStorage.getAllKeys();
    const signedPreKeyIds = allKeys
      .filter(key => key.startsWith('signedPreKey:'))
      .map(key => parseInt(key.replace('signedPreKey:', ''), 10))
      .sort((a, b) => b - a); // Tri décroissant
      
    if (signedPreKeyIds.length === 0) {
      return null;
    }
    
    const latestId = signedPreKeyIds[0];
    const record = await this.loadSignedPreKey(latestId);
    if (!record) {
      return null;
    }
    
    return { id: latestId, record };
  }
}