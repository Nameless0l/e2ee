import { initializeE2EEMessaging } from '../integration/e2ee_initializer';
import { sendEncryptedMessage, sendGroupMessageToServer } from '../integration/message_sender';
import { processIncomingMessage, processIncomingGroupMessage } from '../integration/message_receiver';

// Exemple d'usage
async function exampleUsage() {
  const userId = "alice@example.com";
  const platform = 'android'; // ou 'ios'
  
  try {
    // Initialiser le système de messagerie chiffrée
    const { secureSdk, verificationManager, groupKeyManager } = await initializeE2EEMessaging(userId, platform);
    
    // Exemple d'envoi de message individuel
    const bobId = "bob@example.com";
    const message = "Bonjour Bob, c'est un message chiffré!";
    
    // Envoyer un message à Bob
    await sendEncryptedMessage(secureSdk, bobId, message);
    
    // Exemple de création d'un groupe
    const groupId = "group_123";
    const members = [userId, bobId, "charlie@example.com"];
    
    // Créer un groupe
    await groupKeyManager.createGroup(groupId, members);
    
    // Envoyer un message au groupe
    const groupMessage = "Bonjour tout le monde dans le groupe!";
    const encryptedGroupMessage = await groupKeyManager.encryptGroupMessage(groupId, groupMessage);
    
    // Envoyer le message chiffré au groupe via le serveur
    await sendGroupMessageToServer(encryptedGroupMessage);
    
    // Vérifier l'identité d'un contact
    const verificationCode = await verificationManager.generateVerificationCode(bobId);
    console.log(`Code de vérification pour Bob: ${verificationCode}`);
    
    // Exemple de réception et déchiffrement d'un message individuel
    const receivedEncryptedMessage = await fetchMessageFromServer(); // Hypothétique
    const decryptedMessage = await processIncomingMessage(
      secureSdk,
      "some_sender_id",
      1, // device ID
      receivedEncryptedMessage
    );
    console.log(`Message déchiffré: ${decryptedMessage}`);
    
    // Exemple de réception et déchiffrement d'un message de groupe
    const receivedGroupMessage = await fetchGroupMessageFromServer(); // Hypothétique
    const decryptedGroupMessage = await processIncomingGroupMessage(
      groupKeyManager,
      groupId,
      receivedGroupMessage
    );
    console.log(`Message de groupe déchiffré: ${decryptedGroupMessage}`);
    
  } catch (error) {
    console.error("Erreur lors de l'initialisation ou de l'utilisation du système de messagerie:", error);
  }
}

// Fonctions hypothétiques pour récupérer les messages du serveur
async function fetchMessageFromServer(): Promise<EncryptedMessage> {
  // Simuler la récupération d'un message depuis le serveur
  return {
    type: 1,
    body: "base64_encrypted_content",
    recipientId: "alice@example.com",
    deviceId: 1
  };
}

async function fetchGroupMessageFromServer(): Promise<EncryptedGroupMessage> {
  // Simuler la récupération d'un message de groupe depuis le serveur
  return {
    groupId: "group_123",
    keyId: 1,
    ciphertext: "encrypted_content_with_group_key",
    sender: "bob@example.com"
  };
}