interface IdentityKeyStore {
  getIdentityKeyPair(): Promise<IdentityKeyPair>;
  getLocalRegistrationId(): Promise<number>;
  saveIdentity(address: SignalProtocolAddress, identityKey: PublicKey): Promise<boolean>;
  isTrustedIdentity(address: SignalProtocolAddress, identityKey: PublicKey): Promise<boolean>;
  getIdentity(address: SignalProtocolAddress): Promise<PublicKey | null>;
}

// Compléter l'implémentation de MyIdentityKeyStore
class MyIdentityKeyStore implements IdentityKeyStore {
  private secureStorage: SecureKeyStore;
  
  constructor(secureStorage: SecureKeyStore) {
    this.secureStorage = secureStorage;
  }
  
  async getIdentityKeyPair(): Promise<IdentityKeyPair> {
    const serialized = await this.secureStorage.getEncryptedData('identityKey');
    if (!serialized) {
      throw new Error('Identity key pair not found');
    }
    return IdentityKeyPair.deserialize(Buffer.from(serialized, 'base64'));
  }
  
  async getLocalRegistrationId(): Promise<number> {
    const registrationId = await this.secureStorage.getEncryptedData('registrationId');
    if (!registrationId) {
      throw new Error('Registration ID not found');
    }
    return parseInt(registrationId, 10);
  }
  
  async saveIdentity(address: SignalProtocolAddress, identityKey: PublicKey): Promise<boolean> {
    const addressName = `identity:${address.getName()}:${address.getDeviceId()}`;
    const existing = await this.secureStorage.getEncryptedData(addressName);
    
    if (existing) {
      const existingKey = PublicKey.deserialize(Buffer.from(existing, 'base64'));
      if (existingKey.serialize().equals(identityKey.serialize())) {
        return false;
      }
    }
    
    await this.secureStorage.storeEncryptedData(
      addressName, 
      Buffer.from(identityKey.serialize()).toString('base64')
    );
    return true;
  }
  
  async isTrustedIdentity(address: SignalProtocolAddress, identityKey: PublicKey): Promise<boolean> {
    const existingKey = await this.getIdentity(address);
    if (!existingKey) {
      return true; // Première utilisation
    }
    
    return existingKey.serialize().equals(identityKey.serialize());
  }
  
  async getIdentity(address: SignalProtocolAddress): Promise<PublicKey | null> {
    const addressName = `identity:${address.getName()}:${address.getDeviceId()}`;
    const serialized = await this.secureStorage.getEncryptedData(addressName);
    
    if (!serialized) {
      return null;
    }
    
    return PublicKey.deserialize(Buffer.from(serialized, 'base64'));
  }
  
  // Méthodes additionnelles pour la gestion des clés d'identité
  async storeIdentityKeyPair(identityKeyPair: IdentityKeyPair): Promise<void> {
    await this.secureStorage.storeEncryptedData(
      'identityKey', 
      Buffer.from(identityKeyPair.serialize()).toString('base64')
    );
  }
  
  async storeLocalRegistrationId(registrationId: number): Promise<void> {
    await this.secureStorage.storeEncryptedData(
      'registrationId', 
      registrationId.toString()
    );
  }
}