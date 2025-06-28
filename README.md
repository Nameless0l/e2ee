# 🔐 Secure Storage E2EE

Un système de stockage sécurisé end-to-end pour Android et iOS avec chiffrement des données sensibles.

## 📋 Table des matières

- [🔧 Installation](#-installation)
- [🚀 Utilisation](#-utilisation)
- [🧪 Tests](#-tests)
- [📱 Plateformes supportées](#-plateformes-supportées)
- [🔑 API Reference](#-api-reference)
- [💡 Exemples](#-exemples)
- [🛠️ Développement](#️-développement)

## 🔧 Installation

### Prérequis
- Node.js >= 16.0.0
- TypeScript >= 5.0.0

### Installation des dépendances
```bash
npm install
```

### Installation des outils de développement (optionnel)
```bash
npm install -g typescript ts-node
```

## 🚀 Utilisation

### Import basique
```typescript
import { SecureKeyStoreFactory } from './secure_storage';
```

### Création d'une instance
```typescript
// Pour Android
const androidStore = SecureKeyStoreFactory.create('android');

// Pour iOS
const iosStore = SecureKeyStoreFactory.create('ios');
```

### Opérations de base

#### 📝 Stocker des données
```typescript
await store.storeEncryptedData('user_token', 'mon-token-secret');
await store.storeEncryptedData('api_key', 'api-12345');
```

#### 📖 Récupérer des données
```typescript
const token = await store.getEncryptedData('user_token');
console.log(token); // "mon-token-secret"
```

#### 🗑️ Supprimer des données
```typescript
await store.deleteEncryptedData('user_token');
```

#### 🔑 Lister toutes les clés
```typescript
const allKeys = await store.getAllKeys();
console.log(allKeys); // ['api_key', 'refresh_token']
```

## 🧪 Tests

### 🟢 Test simple (recommandé)
Le plus facile pour commencer :
```bash
node test_simple.js
```

### 🔵 Test complet avec TypeScript
Si vous avez installé ts-node :
```bash
npx ts-node test_secure_storage.ts
```

### 📦 Via NPM scripts
```bash
# Test simple
npm run test:simple

# Test complet
npm test
```

### 🎯 Tests disponibles

Les tests couvrent :
- ✅ **Stockage Android** - Chiffrement avec Android Keystore
- ✅ **Stockage iOS** - Gestion du Keychain iOS
- ✅ **Récupération** - Déchiffrement des données
- ✅ **Suppression** - Nettoyage sécurisé
- ✅ **Gestion d'erreurs** - Clés inexistantes, valeurs vides
- ✅ **Performance** - Test avec 100 éléments
- ✅ **Données complexes** - JSON, objets, chaînes longues

### 📊 Sortie des tests
```
🚀 Démarrage des tests SecureStorage
============================================================

🤖 Tests Android - Opérations de base
==================================================
1️⃣ Test stockage...
✅ Données stockées avec succès
2️⃣ Test récupération...
✅ Récupération réussie
...

🎉 Tous les tests sont terminés !
```

## 📱 Plateformes supportées

### 🤖 Android
- Utilise **Android Keystore** pour le chiffrement
- Stockage dans **SharedPreferences**
- Préfixe des clés : `android_`

### 🍎 iOS
- Utilise **iOS Keychain** pour le stockage sécurisé
- Chiffrement natif iOS
- Préfixe des clés : `ios_`

## 🔑 API Reference

### Interface `SecureKeyStore`

```typescript
interface SecureKeyStore {
  storeEncryptedData(key: string, data: string): Promise<void>;
  getEncryptedData(key: string): Promise<string | null>;
  deleteEncryptedData(key: string): Promise<void>;
  getAllKeys(): Promise<string[]>;
}
```

### Factory `SecureKeyStoreFactory`

```typescript
class SecureKeyStoreFactory {
  static create(platform: 'android' | 'ios'): SecureKeyStore;
}
```

### Méthodes détaillées

#### `storeEncryptedData(key: string, data: string): Promise<void>`
- **Description** : Stocke des données chiffrées
- **Paramètres** :
  - `key` : Identifiant unique pour les données
  - `data` : Données à chiffrer et stocker
- **Throws** : `Error` si le stockage échoue

#### `getEncryptedData(key: string): Promise<string | null>`
- **Description** : Récupère et déchiffre des données
- **Paramètres** :
  - `key` : Identifiant des données à récupérer
- **Retourne** : Les données déchiffrées ou `null` si inexistantes

#### `deleteEncryptedData(key: string): Promise<void>`
- **Description** : Supprime des données stockées
- **Paramètres** :
  - `key` : Identifiant des données à supprimer
- **Throws** : `Error` si la suppression échoue

#### `getAllKeys(): Promise<string[]>`
- **Description** : Récupère toutes les clés stockées
- **Retourne** : Tableau des clés disponibles

## 💡 Exemples

### 📱 Session utilisateur
```typescript
import { SecureKeyStoreFactory } from './secure_storage';

async function gererSessionUtilisateur() {
  const store = SecureKeyStoreFactory.create('android');
  
  // Stockage des informations de session
  await store.storeEncryptedData('session_token', 'abc123def456');
  await store.storeEncryptedData('user_id', '12345');
  await store.storeEncryptedData('last_login', new Date().toISOString());
  
  // Récupération des informations
  const sessionToken = await store.getEncryptedData('session_token');
  const userId = await store.getEncryptedData('user_id');
  
  console.log(`Utilisateur ${userId} connecté avec le token ${sessionToken}`);
  
  // Nettoyage à la déconnexion
  await store.deleteEncryptedData('session_token');
}
```

### 🔧 Configuration d'application
```typescript
async function gererConfiguration() {
  const store = SecureKeyStoreFactory.create('ios');
  
  // Stocker une configuration complexe
  const config = {
    apiEndpoint: 'https://api.example.com',
    timeout: 5000,
    retries: 3,
    credentials: {
      clientId: 'client123',
      clientSecret: 'secret456'
    }
  };
  
  await store.storeEncryptedData('app_config', JSON.stringify(config));
  
  // Récupérer la configuration
  const configStr = await store.getEncryptedData('app_config');
  const retrievedConfig = JSON.parse(configStr);
  
  console.log('Configuration chargée:', retrievedConfig);
}
```

### 🛡️ Gestion des erreurs
```typescript
async function gestionSecurisee() {
  const store = SecureKeyStoreFactory.create('android');
  
  try {
    // Tentative de récupération d'une clé
    const data = await store.getEncryptedData('ma_cle');
    
    if (data === null) {
      console.log('Clé inexistante, utilisation des valeurs par défaut');
      await store.storeEncryptedData('ma_cle', 'valeur_defaut');
    } else {
      console.log('Données récupérées:', data);
    }
    
  } catch (error) {
    console.error('Erreur de stockage sécurisé:', error);
    // Fallback ou gestion d'erreur appropriée
  }
}
```

## 🛠️ Développement

### Structure du projet
```
e2ee/
├── secure_storage.ts          # Implementation principale
├── test_secure_storage.ts     # Tests TypeScript complets
├── test_simple.js            # Tests JavaScript simples
├── package.json              # Configuration NPM
├── tsconfig.json            # Configuration TypeScript
└── README.md                # Ce fichier
```

### Scripts de développement
```bash
# Lancer les tests
npm test

# Build TypeScript
npm run build

# Mode développement avec rechargement automatique
npm run dev
```

### Ajout de nouvelles fonctionnalités

1. **Étendre l'interface** `SecureKeyStore`
2. **Implémenter** dans `AndroidSecureKeyStore` et `iOSSecureKeyStore`
3. **Ajouter des tests** dans `test_secure_storage.ts`
4. **Mettre à jour** cette documentation

### Débogage

#### Activer les logs détaillés
```typescript
// Dans le simulateur de stockage
StorageSimulator.setDebugMode(true);
```

#### Vérifier l'état du stockage
```typescript
const keys = await store.getAllKeys();
console.log('État actuel:', keys);
```

#### Nettoyer le stockage en développement
```typescript
StorageSimulator.clear();
```

## 🔒 Sécurité

### Bonnes pratiques

1. **Ne jamais logger** les données sensibles
2. **Utiliser des clés uniques** pour chaque type de données
3. **Nettoyer les données** à la déconnexion
4. **Gérer les erreurs** de manière appropriée
5. **Tester régulièrement** la récupération des données

### Limitations actuelles

- Chiffrement en simulation (pour la production, utiliser les APIs natives)
- Stockage en mémoire pour les tests
- Pas de rotation automatique des clés

## 📝 Changelog

### v1.0.0
- ✅ Implémentation initiale Android/iOS
- ✅ Interface commune `SecureKeyStore`
- ✅ Factory pattern pour la création d'instances
- ✅ Tests complets avec simulations
- ✅ Support des données complexes (JSON)
- ✅ Gestion d'erreurs robuste

## 📞 Support

Pour toute question ou problème :
1. Consulter les tests pour des exemples d'usage
2. Vérifier les logs d'erreur
3. Tester avec `test_simple.js` pour isoler les problèmes

---

*Développé avec ❤️ pour la sécurité des données mobiles*
