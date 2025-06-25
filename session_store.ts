interface SessionStore {
  saveSession(address: SignalProtocolAddress, record: SessionRecord): Promise<void>;
  getSession(address: SignalProtocolAddress): Promise<SessionRecord | null>;
  getSessions(name: string, deviceId?: number): Promise<SessionRecord[]>;
  removeSession(address: SignalProtocolAddress): Promise<void>;
  removeAllSessions(name: string): Promise<void>;
}

class MySessionStore implements SessionStore {
  private secureStorage: SecureKeyStore;
  
  constructor(secureStorage: SecureKeyStore) {
    this.secureStorage = secureStorage;
  }
  
  async saveSession(address: SignalProtocolAddress, record: SessionRecord): Promise<void> {
    const addressName = `session:${address.getName()}:${address.getDeviceId()}`;
    await this.secureStorage.storeEncryptedData(
      addressName, 
      Buffer.from(record.serialize()).toString('base64')
    );
  }
  
  async getSession(address: SignalProtocolAddress): Promise<SessionRecord | null> {
    const addressName = `session:${address.getName()}:${address.getDeviceId()}`;
    const serialized = await this.secureStorage.getEncryptedData(addressName);
    
    if (!serialized) {
      return null;
    }
    
    return SessionRecord.deserialize(Buffer.from(serialized, 'base64'));
  }
  
  async getSessions(name: string, deviceId?: number): Promise<SessionRecord[]> {
    const allKeys = await this.secureStorage.getAllKeys();
    const sessionKeys = allKeys.filter(key => {
      if (!key.startsWith('session:')) return false;
      
      const parts = key.split(':');
      if (parts[1] !== name) return false;
      
      if (deviceId !== undefined) {
        return parseInt(parts[2], 10) === deviceId;
      }
      
      return true;
    });
    
    const sessions: SessionRecord[] = [];
    
    for (const key of sessionKeys) {
      const serialized = await this.secureStorage.getEncryptedData(key);
      if (serialized) {
        sessions.push(SessionRecord.deserialize(Buffer.from(serialized, 'base64')));
      }
    }
    
    return sessions;
  }
  
  async removeSession(address: SignalProtocolAddress): Promise<void> {
    const addressName = `session:${address.getName()}:${address.getDeviceId()}`;
    await this.secureStorage.deleteEncryptedData(addressName);
  }
  
  async removeAllSessions(name: string): Promise<void> {
    const allKeys = await this.secureStorage.getAllKeys();
    const sessionKeys = allKeys.filter(key => {
      if (!key.startsWith('session:')) return false;
      
      const parts = key.split(':');
      return parts[1] === name;
    });
    
    for (const key of sessionKeys) {
      await this.secureStorage.deleteEncryptedData(key);
    }
  }
}