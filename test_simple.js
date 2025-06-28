// Script de test simple sans dépendances externes
const fs = require('fs');
const path = require('path');

// Simuler les modules TypeScript en JavaScript simple
class StorageSimulator {
  static storage = new Map();
  
  static setItem(key, value) {
    this.storage.set(key, value);
    console.log(`📝 Stocké: ${key} = ${value.substring(0, 50)}${value.length > 50 ? '...' : ''}`);
  }
  
  static getItem(key) {
    const value = this.storage.get(key) || null;
    console.log(`📖 Lu: ${key} = ${value ? value.substring(0, 50) + (value.length > 50 ? '...' : '') : 'null'}`);
    return value;
  }
  
  static removeItem(key) {
    console.log(`🗑️ Supprimé: ${key}`);
    this.storage.delete(key);
  }
  
  static getAllKeys() {
    const keys = Array.from(this.storage.keys());
    console.log(`🔑 Toutes les clés: [${keys.join(', ')}]`);
    return keys;
  }
  
  static clear() {
    console.log('🧹 Stockage vidé');
    this.storage.clear();
  }
  
  static getSize() {
    return this.storage.size;
  }
}

class AndroidSecureKeyStore {
  static STORAGE_PREFIX = 'android_';
  
  async storeEncryptedData(key, data) {
    try {
      const encryptedData = await this.encryptData(data);
      await this.saveToSharedPreferences(key, encryptedData);
    } catch (error) {
      throw new Error(`Failed to store data: ${error}`);
    }
  }

  async getEncryptedData(key) {
    try {
      const encryptedData = await this.getFromSharedPreferences(key);
      if (!encryptedData) return null;
      
      return this.decryptData(encryptedData);
    } catch (error) {
      console.error(`Failed to get data: ${error}`);
      return null;
    }
  }
  
  async deleteEncryptedData(key) {
    try {
      await this.removeFromSharedPreferences(key);
    } catch (error) {
      throw new Error(`Failed to delete data: ${error}`);
    }
  }
  
  async getAllKeys() {
    try {
      return this.getAllKeysFromSharedPreferences();
    } catch (error) {
      console.error(`Failed to get all keys: ${error}`);
      return [];
    }
  }
  
  async encryptData(data) {
    return "encrypted_" + data;
  }
  
  async decryptData(encryptedData) {
    return encryptedData.replace("encrypted_", "");
  }
  
  async saveToSharedPreferences(key, value) {
    const storageKey = AndroidSecureKeyStore.STORAGE_PREFIX + key;
    StorageSimulator.setItem(storageKey, value);
  }
  
  async getFromSharedPreferences(key) {
    const storageKey = AndroidSecureKeyStore.STORAGE_PREFIX + key;
    return StorageSimulator.getItem(storageKey);
  }
  
  async removeFromSharedPreferences(key) {
    const storageKey = AndroidSecureKeyStore.STORAGE_PREFIX + key;
    StorageSimulator.removeItem(storageKey);
  }
  
  async getAllKeysFromSharedPreferences() {
    const allKeys = StorageSimulator.getAllKeys();
    return allKeys
      .filter(key => key.startsWith(AndroidSecureKeyStore.STORAGE_PREFIX))
      .map(key => key.replace(AndroidSecureKeyStore.STORAGE_PREFIX, ''));
  }
}

class iOSSecureKeyStore {
  static STORAGE_PREFIX = 'ios_';
  
  async storeEncryptedData(key, data) {
    try {
      const encryptedData = await this.encryptData(data);
      await this.saveToKeychain(key, encryptedData);
    } catch (error) {
      throw new Error(`Failed to store to keychain: ${error}`);
    }
  }

  async getEncryptedData(key) {
    try {
      const encryptedData = await this.getFromKeychain(key);
      if (!encryptedData) return null;
      
      return this.decryptData(encryptedData);
    } catch (error) {
      console.error(`Failed to get from keychain: ${error}`);
      return null;
    }
  }
  
  async deleteEncryptedData(key) {
    try {
      await this.removeFromKeychain(key);
    } catch (error) {
      throw new Error(`Failed to delete from keychain: ${error}`);
    }
  }
  
  async getAllKeys() {
    try {
      return this.getAllKeysFromKeychain();
    } catch (error) {
      console.error(`Failed to get all keychain keys: ${error}`);
      return [];
    }
  }
  
  async encryptData(data) {
    return "ios_encrypted_" + data;
  }
  
  async decryptData(encryptedData) {
    return encryptedData.replace("ios_encrypted_", "");
  }
  
  async saveToKeychain(key, value) {
    const storageKey = iOSSecureKeyStore.STORAGE_PREFIX + key;
    StorageSimulator.setItem(storageKey, value);
  }
  
  async getFromKeychain(key) {
    const storageKey = iOSSecureKeyStore.STORAGE_PREFIX + key;
    return StorageSimulator.getItem(storageKey);
  }
  
  async removeFromKeychain(key) {
    const storageKey = iOSSecureKeyStore.STORAGE_PREFIX + key;
    StorageSimulator.removeItem(storageKey);
  }
  
  async getAllKeysFromKeychain() {
    const allKeys = StorageSimulator.getAllKeys();
    return allKeys
      .filter(key => key.startsWith(iOSSecureKeyStore.STORAGE_PREFIX))
      .map(key => key.replace(iOSSecureKeyStore.STORAGE_PREFIX, ''));
  }
}

// Factory
class SecureKeyStoreFactory {
  static create(platform = 'android') {
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

// Tests
async function testAndroid() {
  console.log('\n🤖 Tests Android');
  console.log('='.repeat(50));
  
  const store = SecureKeyStoreFactory.create('android');
  StorageSimulator.clear();
  
  try {
    // Test basique
    console.log('\n1️⃣ Test stockage et récupération...');
    await store.storeEncryptedData('user_token', 'mon-token-secret');
    const token = await store.getEncryptedData('user_token');
    
    if (token === 'mon-token-secret') {
      console.log('✅ Test basique réussi');
    } else {
      console.log('❌ Test basique échoué');
    }
    
    // Test multiple
    console.log('\n2️⃣ Test stockage multiple...');
    await store.storeEncryptedData('api_key', 'api-12345');
    await store.storeEncryptedData('refresh_token', 'refresh-67890');
    
    const keys = await store.getAllKeys();
    console.log(`Nombre de clés: ${keys.length}`);
    
    // Test suppression
    console.log('\n3️⃣ Test suppression...');
    await store.deleteEncryptedData('user_token');
    const deletedToken = await store.getEncryptedData('user_token');
    
    if (deletedToken === null) {
      console.log('✅ Test suppression réussi');
    } else {
      console.log('❌ Test suppression échoué');
    }
    
  } catch (error) {
    console.error(`❌ Erreur Android: ${error}`);
  }
}

async function testiOS() {
  console.log('\n🍎 Tests iOS');
  console.log('='.repeat(50));
  
  const store = SecureKeyStoreFactory.create('ios');
  StorageSimulator.clear();
  
  try {
    // Test basique
    console.log('\n1️⃣ Test stockage et récupération...');
    await store.storeEncryptedData('password', 'motdepasse123');
    const password = await store.getEncryptedData('password');
    
    if (password === 'motdepasse123') {
      console.log('✅ Test basique réussi');
    } else {
      console.log('❌ Test basique échoué');
    }
    
    // Test données JSON
    console.log('\n2️⃣ Test données complexes...');
    const userData = JSON.stringify({
      userId: 12345,
      email: 'test@example.com'
    });
    
    await store.storeEncryptedData('user_data', userData);
    const retrievedUserData = await store.getEncryptedData('user_data');
    
    if (retrievedUserData === userData) {
      console.log('✅ Test données complexes réussi');
    } else {
      console.log('❌ Test données complexes échoué');
    }
    
  } catch (error) {
    console.error(`❌ Erreur iOS: ${error}`);
  }
}

async function testErrorHandling() {
  console.log('\n🚨 Tests de gestion des erreurs');
  console.log('='.repeat(50));
  
  const store = SecureKeyStoreFactory.create('android');
  StorageSimulator.clear();
  
  try {
    // Test clé inexistante
    console.log('\n1️⃣ Test clé inexistante...');
    const nonExistent = await store.getEncryptedData('cle_inexistante');
    
    if (nonExistent === null) {
      console.log('✅ Gestion clé inexistante réussie');
    } else {
      console.log('❌ Gestion clé inexistante échouée');
    }
    
    // Test valeur vide
    console.log('\n2️⃣ Test valeur vide...');
    await store.storeEncryptedData('empty', '');
    const empty = await store.getEncryptedData('empty');
    
    if (empty === '') {
      console.log('✅ Gestion valeur vide réussie');
    } else {
      console.log('❌ Gestion valeur vide échouée');
    }
    
  } catch (error) {
    console.error(`❌ Erreur dans tests d'erreur: ${error}`);
  }
}

async function runAllTests() {
  console.log('🚀 Démarrage des tests SecureStorage');
  console.log('='.repeat(60));
  
  try {
    await testAndroid();
    await testiOS();
    await testErrorHandling();
    
    console.log('\n🎉 Tous les tests sont terminés !');
    console.log(`📊 Éléments en stockage: ${StorageSimulator.getSize()}`);
    
  } catch (error) {
    console.error(`❌ Erreur générale: ${error}`);
  }
}

// Exécution
if (require.main === module) {
  runAllTests()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(`💥 Erreur fatale: ${error}`);
      process.exit(1);
    });
}
