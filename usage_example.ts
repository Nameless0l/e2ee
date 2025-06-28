/**
 * 📱 Exemple d'utilisation pratique du Secure Storage
 * 
 * Ce fichier montre comment utiliser le système de stockage sécurisé
 * dans une application réelle.
 */

import { SecureKeyStoreFactory, SecureKeyStore } from './secure_storage';

// 👤 Gestionnaire de session utilisateur
class SessionManager {
  private store: SecureKeyStore;
  
  constructor(platform: 'android' | 'ios' = 'android') {
    this.store = SecureKeyStoreFactory.create(platform);
  }
  
  // Connexion utilisateur
  async login(userId: string, token: string, refreshToken: string) {
    try {
      await this.store.storeEncryptedData('user_id', userId);
      await this.store.storeEncryptedData('access_token', token);
      await this.store.storeEncryptedData('refresh_token', refreshToken);
      await this.store.storeEncryptedData('login_time', new Date().toISOString());
      
      console.log('✅ Session utilisateur sauvegardée de manière sécurisée');
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde de session:', error);
      throw error;
    }
  }
  
  // Récupération des informations de session
  async getSessionInfo() {
    try {
      const userId = await this.store.getEncryptedData('user_id');
      const accessToken = await this.store.getEncryptedData('access_token');
      const refreshToken = await this.store.getEncryptedData('refresh_token');
      const loginTime = await this.store.getEncryptedData('login_time');
      
      if (!userId || !accessToken) {
        return null; // Pas de session active
      }
      
      return {
        userId,
        accessToken,
        refreshToken,
        loginTime: new Date(loginTime || '')
      };
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de session:', error);
      return null;
    }
  }
  
  // Vérifier si l'utilisateur est connecté
  async isLoggedIn(): Promise<boolean> {
    const session = await this.getSessionInfo();
    return session !== null;
  }
  
  // Déconnexion (nettoyage sécurisé)
  async logout() {
    try {
      await this.store.deleteEncryptedData('user_id');
      await this.store.deleteEncryptedData('access_token');
      await this.store.deleteEncryptedData('refresh_token');
      await this.store.deleteEncryptedData('login_time');
      
      console.log('✅ Session nettoyée de manière sécurisée');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage de session:', error);
    }
  }
}

// 🔧 Gestionnaire de configuration d'application
class AppConfigManager {
  private store: SecureKeyStore;
  
  constructor(platform: 'android' | 'ios' = 'android') {
    this.store = SecureKeyStoreFactory.create(platform);
  }
  
  // Sauvegarder la configuration API
  async saveApiConfig(config: {
    endpoint: string;
    clientId: string;
    clientSecret: string;
    timeout?: number;
  }) {
    try {
      await this.store.storeEncryptedData('api_config', JSON.stringify(config));
      console.log('✅ Configuration API sauvegardée');
    } catch (error) {
      console.error('❌ Erreur sauvegarde config:', error);
      throw error;
    }
  }
  
  // Récupérer la configuration API
  async getApiConfig() {
    try {
      const configStr = await this.store.getEncryptedData('api_config');
      if (!configStr) return null;
      
      return JSON.parse(configStr);
    } catch (error) {
      console.error('❌ Erreur récupération config:', error);
      return null;
    }
  }
  
  // Sauvegarder les préférences utilisateur
  async saveUserPreferences(preferences: {
    theme: 'light' | 'dark';
    language: string;
    notifications: boolean;
    biometricAuth?: boolean;
  }) {
    try {
      await this.store.storeEncryptedData('user_preferences', JSON.stringify(preferences));
      console.log('✅ Préférences utilisateur sauvegardées');
    } catch (error) {
      console.error('❌ Erreur sauvegarde préférences:', error);
    }
  }
  
  // Récupérer les préférences utilisateur
  async getUserPreferences() {
    try {
      const prefStr = await this.store.getEncryptedData('user_preferences');
      if (!prefStr) {
        // Retourner des préférences par défaut
        return {
          theme: 'light' as const,
          language: 'fr',
          notifications: true,
          biometricAuth: false
        };
      }
      
      return JSON.parse(prefStr);
    } catch (error) {
      console.error('❌ Erreur récupération préférences:', error);
      return null;
    }
  }
}

// 🛡️ Gestionnaire de données sensibles
class SecureDataManager {
  private store: SecureKeyStore;
  
  constructor(platform: 'android' | 'ios' = 'android') {
    this.store = SecureKeyStoreFactory.create(platform);
  }
  
  // Sauvegarder des informations bancaires (exemple)
  async saveBankingInfo(info: {
    cardLastFour: string;
    bankName: string;
    accountType: string;
  }) {
    try {
      await this.store.storeEncryptedData('banking_info', JSON.stringify(info));
      console.log('✅ Informations bancaires sauvegardées de manière sécurisée');
    } catch (error) {
      console.error('❌ Erreur sauvegarde données bancaires:', error);
      throw error;
    }
  }
  
  // Sauvegarder un PIN ou code d'accès
  async savePinCode(pin: string) {
    try {
      // Hash du PIN avant stockage (dans un vrai projet)
      await this.store.storeEncryptedData('user_pin', pin);
      console.log('✅ PIN sauvegardé de manière sécurisée');
    } catch (error) {
      console.error('❌ Erreur sauvegarde PIN:', error);
      throw error;
    }
  }
  
  // Vérifier le PIN
  async verifyPin(inputPin: string): Promise<boolean> {
    try {
      const storedPin = await this.store.getEncryptedData('user_pin');
      return storedPin === inputPin;
    } catch (error) {
      console.error('❌ Erreur vérification PIN:', error);
      return false;
    }
  }
  
  // Lister toutes les données stockées (pour debug)
  async listStoredData() {
    try {
      const keys = await this.store.getAllKeys();
      console.log('🔑 Données stockées:', keys);
      return keys;
    } catch (error) {
      console.error('❌ Erreur listage données:', error);
      return [];
    }
  }
  
  // Nettoyer toutes les données sensibles
  async clearAllSensitiveData() {
    try {
      const keys = await this.store.getAllKeys();
      for (const key of keys) {
        await this.store.deleteEncryptedData(key);
      }
      console.log('✅ Toutes les données sensibles ont été supprimées');
    } catch (error) {
      console.error('❌ Erreur nettoyage données:', error);
    }
  }
}

// 🧪 Fonction de démonstration
async function demonstrationComplete() {
  console.log('🚀 Démonstration complète du Secure Storage\n');
  
  // 1. Gestion de session
  console.log('1️⃣ Test Session Manager');
  const sessionManager = new SessionManager('android');
  
  await sessionManager.login('user123', 'token_abc', 'refresh_xyz');
  
  const isLoggedIn = await sessionManager.isLoggedIn();
  console.log(`Utilisateur connecté: ${isLoggedIn}`);
  
  const sessionInfo = await sessionManager.getSessionInfo();
  console.log('Infos session:', sessionInfo);
  
  // 2. Gestion de configuration
  console.log('\n2️⃣ Test Config Manager');
  const configManager = new AppConfigManager('android');
  
  await configManager.saveApiConfig({
    endpoint: 'https://api.monapp.com',
    clientId: 'client_123',
    clientSecret: 'secret_456',
    timeout: 5000
  });
  
  await configManager.saveUserPreferences({
    theme: 'dark',
    language: 'fr',
    notifications: true,
    biometricAuth: true
  });
  
  const apiConfig = await configManager.getApiConfig();
  const userPrefs = await configManager.getUserPreferences();
  console.log('Config API:', apiConfig);
  console.log('Préférences:', userPrefs);
  
  // 3. Données sensibles
  console.log('\n3️⃣ Test Secure Data Manager');
  const secureManager = new SecureDataManager('android');
  
  await secureManager.savePinCode('1234');
  await secureManager.saveBankingInfo({
    cardLastFour: '4567',
    bankName: 'Ma Banque',
    accountType: 'Courant'
  });
  
  const pinValid = await secureManager.verifyPin('1234');
  console.log(`PIN valide: ${pinValid}`);
  
  const invalidPin = await secureManager.verifyPin('0000');
  console.log(`PIN invalide: ${!invalidPin}`);
  
  // 4. État final
  console.log('\n4️⃣ État final du stockage');
  await secureManager.listStoredData();
  
  // 5. Nettoyage de session (simulation de déconnexion)
  console.log('\n5️⃣ Simulation de déconnexion');
  await sessionManager.logout();
  
  const stillLoggedIn = await sessionManager.isLoggedIn();
  console.log(`Encore connecté après logout: ${stillLoggedIn}`);
  
  console.log('\n✨ Démonstration terminée !');
}

// Exporter les classes pour utilisation
export { SessionManager, AppConfigManager, SecureDataManager, demonstrationComplete };

// Auto-exécution si le fichier est lancé directement
if (require.main === module) {
  demonstrationComplete()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('💥 Erreur dans la démonstration:', error);
      process.exit(1);
    });
}
