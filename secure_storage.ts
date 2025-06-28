// Définir l'interface commune et compléter les implémentations
interface SecureKeyStore {
  storeEncryptedData(key: string, data: string): Promise<void>;
  getEncryptedData(key: string): Promise<string | null>;
  deleteEncryptedData(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

// Simulateur de stockage pour les tests
class StorageSimulator {
  private static storage = new Map<string, string>();
  
  static setItem(key: string, value: string): void {
    this.storage.set(key, value);
  }
  
  static getItem(key: string): string | null {
    return this.storage.get(key) || null;
  }
  
  static removeItem(key: string): void {
    this.storage.delete(key);
  }
  
  static getAllKeys(): string[] {
    return Array.from(this.storage.keys());
  }
  
  static clear(): void {
    this.storage.clear();
  }
}

// Implémentation pour Android
class AndroidSecureKeyStore implements SecureKeyStore {
  private static ALIAS_SEPARATOR = '_';
  private static STORAGE_PREFIX = 'android_';
  
  async storeEncryptedData(key: string, data: string): Promise<void> {
    try {
      // Utiliser Android Keystore pour chiffrer les données
      const encryptedData = await this.encryptData(data);
      await this.saveToSharedPreferences(key, encryptedData);
    } catch (error) {
      throw new Error(`Failed to store data: ${error}`);
    }
  }

  async getEncryptedData(key: string): Promise<string | null> {
    try {
      const encryptedData = await this.getFromSharedPreferences(key);
      if (!encryptedData) return null;
      
      // Déchiffrer les données en utilisant Android Keystore
      return this.decryptData(encryptedData);
    } catch (error) {
      console.error(`Failed to get data: ${error}`);
      return null;
    }
  }
  
  async deleteEncryptedData(key: string): Promise<void> {
    try {
      await this.removeFromSharedPreferences(key);
    } catch (error) {
      throw new Error(`Failed to delete data: ${error}`);
    }
  }
  
  async getAllKeys(): Promise<string[]> {
    try {
      // Récupérer toutes les clés depuis SharedPreferences
      return this.getAllKeysFromSharedPreferences();
    } catch (error) {
      console.error(`Failed to get all keys: ${error}`);
      return [];
    }
  }
  
  // Méthodes d'implémentation internes pour Android
  private async encryptData(data: string): Promise<string> {
    // Utilisation de l'API de chiffrement d'Android
    // Code spécifique à l'implémentation Android
    return "encrypted_" + data; // Simulation
  }
  
  private async decryptData(encryptedData: string): Promise<string> {
    // Utilisation de l'API de déchiffrement d'Android
    // Code spécifique à l'implémentation Android
    return encryptedData.replace("encrypted_", ""); // Simulation
  }
  
  private async saveToSharedPreferences(key: string, value: string): Promise<void> {
    // Sauvegarder dans les SharedPreferences
    const storageKey = AndroidSecureKeyStore.STORAGE_PREFIX + key;
    StorageSimulator.setItem(storageKey, value);
  }
  
  private async getFromSharedPreferences(key: string): Promise<string | null> {
    // Récupérer depuis les SharedPreferences
    const storageKey = AndroidSecureKeyStore.STORAGE_PREFIX + key;
    return StorageSimulator.getItem(storageKey);
  }
  
  private async removeFromSharedPreferences(key: string): Promise<void> {
    // Supprimer des SharedPreferences
    const storageKey = AndroidSecureKeyStore.STORAGE_PREFIX + key;
    StorageSimulator.removeItem(storageKey);
  }
  
  private async getAllKeysFromSharedPreferences(): Promise<string[]> {
    // Récupérer toutes les clés des SharedPreferences
    const allKeys = StorageSimulator.getAllKeys();
    return allKeys
      .filter(key => key.startsWith(AndroidSecureKeyStore.STORAGE_PREFIX))
      .map(key => key.replace(AndroidSecureKeyStore.STORAGE_PREFIX, ''));
  }
}

// Implémentation pour iOS
class iOSSecureKeyStore implements SecureKeyStore {
  private static STORAGE_PREFIX = 'ios_';
  
  async storeEncryptedData(key: string, data: string): Promise<void> {
    try {
      // Utiliser iOS Keychain pour stocker les données
      const encryptedData = await this.encryptData(data);
      await this.saveToKeychain(key, encryptedData);
    } catch (error) {
      throw new Error(`Failed to store to keychain: ${error}`);
    }
  }

  async getEncryptedData(key: string): Promise<string | null> {
    try {
      // Récupérer depuis iOS Keychain
      const encryptedData = await this.getFromKeychain(key);
      if (!encryptedData) return null;
      
      return this.decryptData(encryptedData);
    } catch (error) {
      console.error(`Failed to get from keychain: ${error}`);
      return null;
    }
  }
  
  async deleteEncryptedData(key: string): Promise<void> {
    try {
      // Supprimer de iOS Keychain
      await this.removeFromKeychain(key);
    } catch (error) {
      throw new Error(`Failed to delete from keychain: ${error}`);
    }
  }
  
  async getAllKeys(): Promise<string[]> {
    try {
      // Récupérer toutes les clés de iOS Keychain
      return this.getAllKeysFromKeychain();
    } catch (error) {
      console.error(`Failed to get all keychain keys: ${error}`);
      return [];
    }
  }
  
  // Méthodes d'implémentation internes pour iOS
  private async encryptData(data: string): Promise<string> {
    // Simulation simple de chiffrement
    return "ios_encrypted_" + data;
  }
  
  private async decryptData(encryptedData: string): Promise<string> {
    // Simulation simple de déchiffrement
    return encryptedData.replace("ios_encrypted_", "");
  }
  
  private async saveToKeychain(key: string, value: string): Promise<void> {
    const storageKey = iOSSecureKeyStore.STORAGE_PREFIX + key;
    StorageSimulator.setItem(storageKey, value);
  }
  
  private async getFromKeychain(key: string): Promise<string | null> {
    const storageKey = iOSSecureKeyStore.STORAGE_PREFIX + key;
    return StorageSimulator.getItem(storageKey);
  }
  
  private async removeFromKeychain(key: string): Promise<void> {
    const storageKey = iOSSecureKeyStore.STORAGE_PREFIX + key;
    StorageSimulator.removeItem(storageKey);
  }
  
  private async getAllKeysFromKeychain(): Promise<string[]> {
    const allKeys = StorageSimulator.getAllKeys();
    return allKeys
      .filter(key => key.startsWith(iOSSecureKeyStore.STORAGE_PREFIX))
      .map(key => key.replace(iOSSecureKeyStore.STORAGE_PREFIX, ''));
  }
}

// Factory pour créer l'instance appropriée selon la plateforme
class SecureKeyStoreFactory {
  static create(platform: 'android' | 'ios' = 'android'): SecureKeyStore {
    switch (platform) {
      case 'android':
        return new AndroidSecureKeyStore();
      case 'ios':
        return new iOSSecureKeyStore();
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }
}

// Export des classes principales
export { 
  SecureKeyStore, 
  AndroidSecureKeyStore, 
  iOSSecureKeyStore, 
  SecureKeyStoreFactory,
  StorageSimulator 
};