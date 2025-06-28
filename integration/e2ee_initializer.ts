import { SecureMessagingSDK } from '../messaging_sdk';
import { AndroidSecureKeyStore, iOSSecureKeyStore, SecureKeyStore } from '../secure_storage';
import { MyIdentityKeyStore } from '../identity_key_store';
import { MyPreKeyStore } from '../pre_key_store';
import { MySignedPreKeyStore } from '../signed_pre_key_store';
import { MySessionStore } from '../session_store';
import { E2EEVerificationManager } from '../verification/verification_manager';
import { E2EEGroupKeyManager } from '../group_messaging/group_key_manager';

// Initialisation complète du système de messagerie chiffrée
export async function initializeE2EEMessaging(userId: string, platform: 'android' | 'ios'): Promise<{
  secureSdk: SecureMessagingSDK,
  verificationManager: E2EEVerificationManager,
  groupKeyManager: E2EEGroupKeyManager
}> {
  // Créer le stockage sécurisé selon la plateforme
  const secureStorage = platform === 'android' 
    ? new AndroidSecureKeyStore() 
    : new iOSSecureKeyStore();
  
  // Initialiser les stores
  const identityKeyStore = new MyIdentityKeyStore(secureStorage);
  const preKeyStore = new MyPreKeyStore(secureStorage);
  const signedPreKeyStore = new MySignedPreKeyStore(secureStorage);
  const sessionStore = new MySessionStore(secureStorage);
  
  // Créer le SDK
  const secureSdk = new SecureMessagingSDK({
    identityKeyStore,
    preKeyStore,
    signedPreKeyStore,
    sessionStore
  });
  
  // Initialiser l'utilisateur (génère ou charge les clés)
  await secureSdk.initializeUser(userId);
  
  // Créer les gestionnaires
  const verificationManager = new E2EEVerificationManager(secureSdk);
  const groupKeyManager = new E2EEGroupKeyManager(secureSdk, secureStorage);
  
  return {
    secureSdk,
    verificationManager,
    groupKeyManager
  };
}