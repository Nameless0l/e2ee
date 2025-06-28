import { 
  SecureKeyStore, 
  AndroidSecureKeyStore, 
  iOSSecureKeyStore, 
  SecureKeyStoreFactory,
  StorageSimulator 
} from './secure_storage';

// Classe de test avec utilitaires
class SecureStorageTests {
  
  // Test basique pour Android
  static async testAndroidBasicOperations() {
    console.log('\n🤖 Tests Android - Opérations de base');
    console.log('=' .repeat(50));
    
    const store = SecureKeyStoreFactory.create('android');
    
    try {
      // Nettoyer le stockage avant le test
      StorageSimulator.clear();
      
      // Test 1: Stocker des données
      console.log('\n1️⃣ Test stockage...');
      await store.storeEncryptedData('user_token', 'mon-token-secret');
      console.log('✅ Données stockées avec succès');
      
      // Test 2: Récupérer des données
      console.log('\n2️⃣ Test récupération...');
      const retrievedToken = await store.getEncryptedData('user_token');
      console.log(`Données récupérées: "${retrievedToken}"`);
      
      if (retrievedToken === 'mon-token-secret') {
        console.log('✅ Récupération réussie');
      } else {
        console.log('❌ Échec de la récupération');
      }
      
      // Test 3: Stocker plusieurs éléments
      console.log('\n3️⃣ Test stockage multiple...');
      await store.storeEncryptedData('api_key', 'api-12345');
      await store.storeEncryptedData('refresh_token', 'refresh-67890');
      console.log('✅ Plusieurs éléments stockés');
      
      // Test 4: Lister toutes les clés
      console.log('\n4️⃣ Test liste des clés...');
      const allKeys = await store.getAllKeys();
      console.log(`Clés trouvées: [${allKeys.join(', ')}]`);
      console.log(`Nombre de clés: ${allKeys.length}`);
      
      // Test 5: Supprimer un élément
      console.log('\n5️⃣ Test suppression...');
      await store.deleteEncryptedData('user_token');
      const deletedToken = await store.getEncryptedData('user_token');
      
      if (deletedToken === null) {
        console.log('✅ Suppression réussie');
      } else {
        console.log('❌ Échec de la suppression');
      }
      
      // Vérifier les clés restantes
      const remainingKeys = await store.getAllKeys();
      console.log(`Clés restantes: [${remainingKeys.join(', ')}]`);
      
    } catch (error) {
      console.error(`❌ Erreur dans le test Android: ${error}`);
    }
  }
  
  // Test basique pour iOS
  static async testiOSBasicOperations() {
    console.log('\n🍎 Tests iOS - Opérations de base');
    console.log('=' .repeat(50));
    
    const store = SecureKeyStoreFactory.create('ios');
    
    try {
      // Nettoyer le stockage avant le test
      StorageSimulator.clear();
      
      // Test 1: Stocker des données
      console.log('\n1️⃣ Test stockage...');
      await store.storeEncryptedData('password', 'motdepasse123');
      console.log('✅ Données stockées avec succès');
      
      // Test 2: Récupérer des données
      console.log('\n2️⃣ Test récupération...');
      const retrievedPassword = await store.getEncryptedData('password');
      console.log(`Données récupérées: "${retrievedPassword}"`);
      
      if (retrievedPassword === 'motdepasse123') {
        console.log('✅ Récupération réussie');
      } else {
        console.log('❌ Échec de la récupération');
      }
      
      // Test 3: Test avec données complexes
      console.log('\n3️⃣ Test données complexes...');
      const complexData = JSON.stringify({
        userId: 12345,
        email: 'test@example.com',
        preferences: { theme: 'dark', language: 'fr' }
      });
      
      await store.storeEncryptedData('user_data', complexData);
      const retrievedComplexData = await store.getEncryptedData('user_data');
      
      if (retrievedComplexData === complexData) {
        console.log('✅ Données complexes gérées correctement');
      } else {
        console.log('❌ Problème avec les données complexes');
      }
      
    } catch (error) {
      console.error(`❌ Erreur dans le test iOS: ${error}`);
    }
  }
  
  // Test de gestion des erreurs
  static async testErrorHandling() {
    console.log('\n🚨 Tests de gestion des erreurs');
    console.log('=' .repeat(50));
    
    const store = SecureKeyStoreFactory.create('android');
    
    try {
      // Nettoyer le stockage
      StorageSimulator.clear();
      
      // Test 1: Récupérer une clé inexistante
      console.log('\n1️⃣ Test clé inexistante...');
      const nonExistentData = await store.getEncryptedData('cle_inexistante');
      
      if (nonExistentData === null) {
        console.log('✅ Retourne null pour une clé inexistante');
      } else {
        console.log('❌ Devrait retourner null');
      }
      
      // Test 2: Supprimer une clé inexistante
      console.log('\n2️⃣ Test suppression clé inexistante...');
      await store.deleteEncryptedData('cle_inexistante');
      console.log('✅ Suppression d\'une clé inexistante gérée');
      
      // Test 3: Stocker une valeur vide
      console.log('\n3️⃣ Test valeur vide...');
      await store.storeEncryptedData('empty_value', '');
      const emptyValue = await store.getEncryptedData('empty_value');
      
      if (emptyValue === '') {
        console.log('✅ Valeur vide gérée correctement');
      } else {
        console.log('❌ Problème avec la valeur vide');
      }
      
    } catch (error) {
      console.error(`❌ Erreur dans le test de gestion des erreurs: ${error}`);
    }
  }
  
  // Test de performance basique
  static async testPerformance() {
    console.log('\n⚡ Tests de performance');
    console.log('=' .repeat(50));
    
    const store = SecureKeyStoreFactory.create('android');
    StorageSimulator.clear();
    
    try {
      const startTime = Date.now();
      
      // Stocker 100 éléments
      console.log('\n📦 Stockage de 100 éléments...');
      for (let i = 0; i < 100; i++) {
        await store.storeEncryptedData(`key_${i}`, `value_${i}`);
      }
      
      const storageTime = Date.now() - startTime;
      console.log(`✅ 100 éléments stockés en ${storageTime}ms`);
      
      // Récupérer tous les éléments
      console.log('\n📖 Récupération de 100 éléments...');
      const retrievalStart = Date.now();
      
      for (let i = 0; i < 100; i++) {
        const value = await store.getEncryptedData(`key_${i}`);
        if (value !== `value_${i}`) {
          console.log(`❌ Erreur à l'index ${i}`);
        }
      }
      
      const retrievalTime = Date.now() - retrievalStart;
      console.log(`✅ 100 éléments récupérés en ${retrievalTime}ms`);
      
      // Vérifier le nombre total de clés
      const allKeys = await store.getAllKeys();
      console.log(`📊 Nombre total de clés: ${allKeys.length}`);
      
    } catch (error) {
      console.error(`❌ Erreur dans le test de performance: ${error}`);
    }
  }
  
  // Exécuter tous les tests
  static async runAllTests() {
    console.log('🚀 Démarrage des tests SecureStorage');
    console.log('=' .repeat(60));
    
    try {
      await this.testAndroidBasicOperations();
      await this.testiOSBasicOperations();
      await this.testErrorHandling();
      await this.testPerformance();
      
      console.log('\n🎉 Tous les tests sont terminés !');
      console.log('=' .repeat(60));
      
    } catch (error) {
      console.error(`❌ Erreur générale dans les tests: ${error}`);
    }
  }
}

// Fonction d'exemple d'utilisation
async function exempleUtilisation() {
  console.log('\n📚 Exemple d\'utilisation pratique');
  console.log('=' .repeat(50));
  
  // Créer une instance pour Android
  const androidStore = SecureKeyStoreFactory.create('android');
  
  try {
    // Simuler une session utilisateur
    console.log('\n👤 Simulation d\'une session utilisateur...');
    
    // Stocker les informations de session
    await androidStore.storeEncryptedData('session_token', 'abc123def456');
    await androidStore.storeEncryptedData('user_id', '12345');
    await androidStore.storeEncryptedData('last_login', new Date().toISOString());
    
    // Récupérer les informations
    const sessionToken = await androidStore.getEncryptedData('session_token');
    const userId = await androidStore.getEncryptedData('user_id');
    const lastLogin = await androidStore.getEncryptedData('last_login');
    
    console.log(`Session Token: ${sessionToken}`);
    console.log(`User ID: ${userId}`);
    console.log(`Dernière connexion: ${lastLogin}`);
    
    // Lister toutes les clés de session
    const sessionKeys = await androidStore.getAllKeys();
    console.log(`Clés de session: [${sessionKeys.join(', ')}]`);
    
    console.log('✅ Exemple d\'utilisation terminé');
    
  } catch (error) {
    console.error(`❌ Erreur dans l'exemple: ${error}`);
  }
}

// Auto-exécution si le fichier est lancé directement
if (require.main === module) {
  console.log('🔐 Tests SecureStorage - Démarrage automatique\n');
  
  SecureStorageTests.runAllTests()
    .then(() => exempleUtilisation())
    .then(() => {
      console.log('\n✨ Tous les tests et exemples sont terminés !');
      process.exit(0);
    })
    .catch(error => {
      console.error(`💥 Erreur fatale: ${error}`);
      process.exit(1);
    });
}

// Exports pour utilisation dans d'autres fichiers
export { SecureStorageTests, exempleUtilisation };
