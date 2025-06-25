import { SecureMessagingSDK } from '../messaging_sdk';
import { EncryptedMessage } from '../types/messaging_types';
import { E2EEGroupKeyManager, EncryptedGroupMessage } from '../group_messaging/group_key_manager';

// Fonction pour recevoir et traiter un message individuel entrant
export async function processIncomingMessage(
  sdk: SecureMessagingSDK, 
  senderId: string, 
  senderDeviceId: number, 
  encryptedMessage: EncryptedMessage
): Promise<string> {
  try {
    // Déchiffrer le message
    const plaintext = await sdk.receiveSecureMessage(senderId, senderDeviceId, encryptedMessage);
    
    // Vérifier l'identité de l'expéditeur si nécessaire
    // (Logique additionnelle si nécessaire)
    
    return plaintext;
    
  } catch (error) {
    console.error("Erreur lors du traitement du message entrant:", error);
    throw error;
  }
}

// Fonction pour recevoir et traiter un message de groupe entrant
export async function processIncomingGroupMessage(
  groupKeyManager: E2EEGroupKeyManager,
  groupId: string,
  encryptedGroupMessage: EncryptedGroupMessage
): Promise<string> {
  try {
    // Vérifier que le message appartient au bon groupe
    if (encryptedGroupMessage.groupId !== groupId) {
      throw new Error("Le message n'appartient pas à ce groupe");
    }
    
    // Déchiffrer le message de groupe
    const plaintext = await groupKeyManager.decryptGroupMessage(groupId, encryptedGroupMessage);
    
    return plaintext;
    
  } catch (error) {
    console.error("Erreur lors du traitement du message de groupe entrant:", error);
    throw error;
  }
}