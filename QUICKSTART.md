# 🚀 Guide de démarrage rapide - Secure Storage

## ⚡ Test immédiat

```bash
# Test le plus simple (aucune installation requise)
node test_simple.js
```

## 📝 Utilisation basique

```typescript
import { SecureKeyStoreFactory } from './secure_storage';

// Créer une instance
const store = SecureKeyStoreFactory.create('android');

// Stocker des données
await store.storeEncryptedData('mon_token', 'valeur_secrete');

// Récupérer des données
const token = await store.getEncryptedData('mon_token');

// Supprimer des données
await store.deleteEncryptedData('mon_token');
```

## 🧪 Tests disponibles

| Commande | Description |
|----------|-------------|
| `node test_simple.js` | Test simple sans dépendances |
| `npx ts-node test_secure_storage.ts` | Test complet TypeScript |
| `npm test` | Test via script NPM |

## 📱 Plateformes

- **Android** : `SecureKeyStoreFactory.create('android')`
- **iOS** : `SecureKeyStoreFactory.create('ios')`

## ✅ Résultats attendus

```
🚀 Démarrage des tests SecureStorage
🤖 Tests Android - Opérations de base
✅ Test basique réussi
✅ Test suppression réussi
🍎 Tests iOS - Opérations de base  
✅ Test basique réussi
🎉 Tous les tests sont terminés !
```

## 🔗 Documentation complète

Voir `README.md` pour la documentation détaillée.
