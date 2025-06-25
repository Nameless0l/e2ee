import { SecureMessagingSDK } from '../messaging_sdk';
import { EncryptedMessage } from '../types/messaging_types';
import { EncryptedGroupMessage } from '../group_messaging/group_key_manager';

// Envoyer un message chiffré individuel
export async function sendEncryptedMessage(
  sdk: SecureMessagingSDK, 
  recipientId: string, 
  message: string
): Promise<void> {
  try {
    // Obtenir la liste des appareils du destinataire
    const deviceIds = await sdk.getDevicesList(recipientId);
    
    // Envoyer le message à tous les appareils du destinataire
    const encryptedMessages = await Promise.all(
      deviceIds.map(deviceId => sdk.sendSecureMessage(recipientId, deviceId, message))
    );
    
    // Envoyer les messages chiffrés au serveur
    for (const encryptedMessage of encryptedMessages) {
      await sendMessageToServer(encryptedMessage);
    }
    
    console.log(`Message envoyé avec succès à ${recipientId} sur ${deviceIds.length} appareil(s)`);
    
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    throw error;
  }
}

// Fonction pour envoyer un message chiffré au serveur
export async function sendMessageToServer(encryptedMessage: EncryptedMessage): Promise<void> {
  const response = await fetch('/api/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(encryptedMessage)
  });
  
  if (!response.ok) {
    throw new Error(`Échec d'envoi du message au serveur: ${response.status}`);
  }
}

// Fonction pour envoyer un message de groupe au serveur
export async function sendGroupMessageToServer(encryptedGroupMessage: EncryptedGroupMessage): Promise<void> {
  const response = await fetch('/api/group-messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(encryptedGroupMessage)
  });
  
  if (!response.ok) {
    throw new Error(`Échec d'envoi du message de groupe: ${response.status}`);
  }
}