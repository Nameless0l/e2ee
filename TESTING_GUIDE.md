# 📋 Comment tester et utiliser le Secure Storage

## 🚀 Tests disponibles

### 1. Test rapide (recommandé pour commencer)
```bash
node test_simple.js
```
**Avantages :** Aucune installation requise, test immédiat

### 2. Test complet TypeScript
```bash
npx ts-node test_secure_storage.ts
```
**Avantages :** Tests détaillés avec performance et gestion d'erreurs

### 3. Exemple d'utilisation pratique
```bash
npx ts-node usage_example.ts
```
**Avantages :** Montre comment utiliser dans une vraie application

## 📱 Utilisation dans votre code

### Import et création d'instance
```typescript
import { SecureKeyStoreFactory } from './secure_storage';

// Pour Android
const store = SecureKeyStoreFactory.create('android');

// Pour iOS  
const store = SecureKeyStoreFactory.create('ios');
```

### Opérations de base
```typescript
// Stocker
await store.storeEncryptedData('ma_cle', 'ma_valeur');

// Récupérer
const valeur = await store.getEncryptedData('ma_cle');

// Supprimer
await store.deleteEncryptedData('ma_cle');

// Lister toutes les clés
const cles = await store.getAllKeys();
```

## 🔧 Classes utilitaires disponibles

### SessionManager
```typescript
import { SessionManager } from './usage_example';

const session = new SessionManager('android');
await session.login('user123', 'token', 'refresh');
const isConnected = await session.isLoggedIn();
await session.logout();
```

### AppConfigManager
```typescript
import { AppConfigManager } from './usage_example';

const config = new AppConfigManager('android');
await config.saveApiConfig({
  endpoint: 'https://api.exemple.com',
  clientId: 'client123'
});
```

### SecureDataManager
```typescript
import { SecureDataManager } from './usage_example';

const secure = new SecureDataManager('android');
await secure.savePinCode('1234');
const isValid = await secure.verifyPin('1234');
```

## ✅ Résultats attendus

### Test simple réussi
```
🚀 Démarrage des tests SecureStorage
🤖 Tests Android
✅ Test basique réussi
✅ Test suppression réussi  
🍎 Tests iOS
✅ Test basique réussi
🎉 Tous les tests sont terminés !
```

### Test complet réussi
```
🚀 Démarrage des tests SecureStorage
🤖 Tests Android - Opérations de base
✅ Données stockées avec succès
✅ Récupération réussie
⚡ Tests de performance
✅ 100 éléments stockés en 0ms
🎉 Tous les tests sont terminés !
```

## 🛠️ Commandes utiles

| Commande | Description |
|----------|-------------|
| `node test_simple.js` | Test rapide sans dépendances |
| `npx ts-node test_secure_storage.ts` | Test complet |
| `npx ts-node usage_example.ts` | Exemple d'utilisation |
| `npm test` | Test via script NPM |
| `npm install` | Installer les dépendances |

## 🔍 Débogage

### Vérifier l'état du stockage
```typescript
import { StorageSimulator } from './secure_storage';

// Voir toutes les clés stockées
console.log(StorageSimulator.getAllKeys());

// Nettoyer le stockage
StorageSimulator.clear();
```

### Messages d'erreur courants

| Erreur | Solution |
|--------|----------|
| `Module not found` | Vérifiez que vous êtes dans le bon dossier |
| `Cannot read property` | Assurez-vous que les données existent avant lecture |
| `Failed to store data` | Vérifiez que la clé et la valeur sont des strings |

## 📂 Structure des fichiers

```
e2ee/
├── secure_storage.ts       # Code principal
├── test_simple.js         # Test rapide
├── test_secure_storage.ts # Test complet  
├── usage_example.ts       # Exemples d'usage
├── README.md             # Documentation complète
├── QUICKSTART.md         # Guide rapide
└── TESTING_GUIDE.md     # Ce fichier
```

## 🎯 Prochaines étapes

1. **Tester** : Commencer par `node test_simple.js`
2. **Explorer** : Regarder `usage_example.ts` pour les cas d'usage
3. **Intégrer** : Utiliser dans votre application
4. **Personnaliser** : Adapter selon vos besoins

## 🔒 Bonnes pratiques

- ✅ **Toujours gérer les erreurs** avec try/catch
- ✅ **Nettoyer les données** à la déconnexion
- ✅ **Utiliser des clés uniques** pour chaque type de données
- ✅ **Tester régulièrement** la récupération des données
- ❌ **Ne jamais logger** les données sensibles
- ❌ **Ne pas stocker** de données non chiffrées importantes

## 📞 Support

Si quelque chose ne fonctionne pas :

1. **Vérifiez** que vous êtes dans le bon dossier (`d:\reseau\e2ee`)
2. **Lancez** `node test_simple.js` pour un test rapide
3. **Regardez** les logs d'erreur pour identifier le problème
4. **Consultez** les exemples dans `usage_example.ts`

---

*✨ Votre système de stockage sécurisé est prêt à l'emploi !*
