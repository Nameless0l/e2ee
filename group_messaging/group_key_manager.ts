// Gestion des clés partagées de groupe

import { generateSymmetricKey, encryptWithSymmetricKey, decryptWithSymmetricKey } from '../utils/crypto_utils';

// Interface pour les clés partagées de groupe
export interface GroupKeyManager {
  createGroup(groupId: string, members: string[]): Promise<string>; // Retourne la clé de groupe
  addMemberToGroup(groupId: string, newMemberId: string): Promise<void>;
  removeMemberFromGroup(groupId: string, memberId: string): Promise<void>;
  rotateGroupKey(groupId: string): Promise<string>; // Retourne la nouvelle clé
  encryptGroupMessage(groupId: string, message: string): Promise<EncryptedGroupMessage>;
  decryptGroupMessage(groupId: string, encryptedMessage: EncryptedGroupMessage): Promise<string>;
}

// Message chiffré de groupe
export interface EncryptedGroupMessage {
  groupId: string;
  keyId: number; // ID de la clé utilisée pour le chiffrement
  ciphertext: string; // Message chiffré avec la clé de groupe
  sender: string; // ID de l'expéditeur
}

// Implémentation du gestionnaire de clés de groupe
export class E2EEGroupKeyManager implements GroupKeyManager {
  private sdk: SecureMessagingSDK;
  private secureStorage: SecureKeyStore;
  
  constructor(sdk: SecureMessagingSDK, secureStorage: SecureKeyStore) {
    this.sdk = sdk;
    this.secureStorage = secureStorage;
  }
  
  // Créer un nouveau groupe avec une clé partagée
  async createGroup(groupId: string, members: string[]): Promise<string> {
    // Générer une clé de groupe aléatoire
    const groupKey = generateSymmetricKey();
    const keyId = 1; // Premier ID de clé
    
    // Stocker les informations du groupe
    await this.secureStorage.storeEncryptedData(
      `group:${groupId}:members`, 
      JSON.stringify(members)
    );
    
    await this.secureStorage.storeEncryptedData(
      `group:${groupId}:currentKeyId`, 
      keyId.toString()
    );
    
    await this.secureStorage.storeEncryptedData(
      `group:${groupId}:key:${keyId}`, 
      groupKey
    );
    
    // Distribuer la clé à tous les membres du groupe
    await this.distributeGroupKey(groupId, members, keyId, groupKey);
    
    return groupKey;
  }
  
  // Ajouter un membre au groupe
  async addMemberToGroup(groupId: string, newMemberId: string): Promise<void> {
    // Récupérer les membres actuels
    const membersJson = await this.secureStorage.getEncryptedData(`group:${groupId}:members`);
    if (!membersJson) {
      throw new Error(`Groupe ${groupId} non trouvé`);
    }
    
    const members: string[] = JSON.parse(membersJson);
    
    // Vérifier si le membre est déjà dans le groupe
    if (members.includes(newMemberId)) {
      return; // Déjà membre
    }
    
    // Ajouter le nouveau membre
    members.push(newMemberId);
    
    // Mettre à jour la liste des membres
    await this.secureStorage.storeEncryptedData(
      `group:${groupId}:members`, 
      JSON.stringify(members)
    );
    
    // Récupérer la clé actuelle du groupe
    const currentKeyIdStr = await this.secureStorage.getEncryptedData(`group:${groupId}:currentKeyId`);
    if (!currentKeyIdStr) {
      throw new Error(`Clé de groupe non trouvée pour ${groupId}`);
    }
    
    const currentKeyId = parseInt(currentKeyIdStr, 10);
    const groupKey = await this.secureStorage.getEncryptedData(`group:${groupId}:key:${currentKeyId}`);
    
    if (!groupKey) {
      throw new Error(`Clé de groupe ${currentKeyId} non trouvée pour ${groupId}`);
    }
    
    // Distribuer la clé au nouveau membre
    await this.distributeGroupKey(groupId, [newMemberId], currentKeyId, groupKey);
  }
  
  // Supprimer un membre du groupe
  async removeMemberFromGroup(groupId: string, memberId: string): Promise<void> {
    // Récupérer les membres actuels
    const membersJson = await this.secureStorage.getEncryptedData(`group:${groupId}:members`);
    if (!membersJson) {
      throw new Error(`Groupe ${groupId} non trouvé`);
    }
    
    const members: string[] = JSON.parse(membersJson);
    
    // Supprimer le membre
    const newMembers = members.filter(id => id !== memberId);
    
    // Si les membres sont identiques, le membre n'était pas dans le groupe
    if (newMembers.length === members.length) {
      return;
    }
    
    // Mettre à jour la liste des membres
    await this.secureStorage.storeEncryptedData(
      `group:${groupId}:members`, 
      JSON.stringify(newMembers)
    );
    
    // Faire pivoter la clé du groupe pour exclure le membre supprimé
    await this.rotateGroupKey(groupId);
  }
  
  // Rotation de la clé de groupe
  async rotateGroupKey(groupId: string): Promise<string> {
    // Récupérer l'ID de clé actuel
    const currentKeyIdStr = await this.secureStorage.getEncryptedData(`group:${groupId}:currentKeyId`);
    if (!currentKeyIdStr) {
      throw new Error(`Clé de groupe non trouvée pour ${groupId}`);
    }
    
    const currentKeyId = parseInt(currentKeyIdStr, 10);
    const newKeyId = currentKeyId + 1;
    
    // Générer une nouvelle clé
    const newGroupKey = generateSymmetricKey();
    
    // Stocker la nouvelle clé
    await this.secureStorage.storeEncryptedData(
      `group:${groupId}:key:${newKeyId}`, 
      newGroupKey
    );
    
    // Mettre à jour l'ID de clé actuel
    await this.secureStorage.storeEncryptedData(
      `group:${groupId}:currentKeyId`, 
      newKeyId.toString()
    );
    
    // Récupérer les membres actuels
    const membersJson = await this.secureStorage.getEncryptedData(`group:${groupId}:members`);
    if (!membersJson) {
      throw new Error(`Groupe ${groupId} non trouvé`);
    }
    
    const members: string[] = JSON.parse(membersJson);
    
    // Distribuer la nouvelle clé à tous les membres
    await this.distributeGroupKey(groupId, members, newKeyId, newGroupKey);
    
    return newGroupKey;
  }
  
  // Chiffrer un message pour le groupe
  async encryptGroupMessage(groupId: string, message: string): Promise<EncryptedGroupMessage> {
    // Récupérer l'ID de clé actuel
    const currentKeyIdStr = await this.secureStorage.getEncryptedData(`group:${groupId}:currentKeyId`);
    if (!currentKeyIdStr) {
      throw new Error(`Clé de groupe non trouvée pour ${groupId}`);
    }
    
    const currentKeyId = parseInt(currentKeyIdStr, 10);
    
    // Récupérer la clé de groupe
    const groupKey = await this.secureStorage.getEncryptedData(`group:${groupId}:key:${currentKeyId}`);
    if (!groupKey) {
      throw new Error(`Clé de groupe ${currentKeyId} non trouvée pour ${groupId}`);
    }
    
    // Chiffrer le message avec la clé de groupe
    const ciphertext = encryptWithSymmetricKey(message, groupKey);
    
    // Obtenir l'ID de l'utilisateur actuel
    const userId = await this.getCurrentUserId();
    
    return {
      groupId,
      keyId: currentKeyId,
      ciphertext,
      sender: userId
    };
  }
  
  // Déchiffrer un message de groupe
  async decryptGroupMessage(groupId: string, encryptedMessage: EncryptedGroupMessage): Promise<string> {
    // Vérifier que le message est pour ce groupe
    if (encryptedMessage.groupId !== groupId) {
      throw new Error("Message de groupe incompatible");
    }
    
    // Récupérer la clé de groupe correspondant à l'ID de clé du message
    const groupKey = await this.secureStorage.getEncryptedData(`group:${groupId}:key:${encryptedMessage.keyId}`);
    if (!groupKey) {
      throw new Error(`Clé de groupe ${encryptedMessage.keyId} non trouvée pour ${groupId}`);
    }
    
    // Déchiffrer le message avec la clé de groupe
    return decryptWithSymmetricKey(encryptedMessage.ciphertext, groupKey);
  }
  
  // Méthodes privées
  
  // Distribuer une clé de groupe aux membres
  private async distributeGroupKey(
    groupId: string, 
    memberIds: string[], 
    keyId: number, 
    groupKey: string
  ): Promise<void> {
    // Pour chaque membre du groupe
    for (const memberId of memberIds) {
      // Créer un message contenant les informations de la clé
      const keyInfo = {
        groupId,
        keyId,
        groupKey
      };
      
      // Chiffrer ce message avec la clé publique du membre
      try {
        // Obtenir la liste des appareils du membre
        const deviceIds = await this.sdk.getDevicesList(memberId);
        
        // Envoyer la clé à tous les appareils du membre
        for (const deviceId of deviceIds) {
          const encryptedMessage = await this.sdk.sendSecureMessage(
            memberId, 
            deviceId, 
            JSON.stringify(keyInfo)
          );
          
          // Envoyer le message chiffré au serveur
          await this.sendDistributionMessageToServer(encryptedMessage, 'group_key');
        }
        
      } catch (error) {
        console.error(`Erreur lors de la distribution de la clé de groupe à ${memberId}:`, error);
        // Continuer avec les autres membres
      }
    }
  }
  
  // Envoyer un message de distribution au serveur
  private async sendDistributionMessageToServer(
    encryptedMessage: EncryptedMessage, 
    type: string
  ): Promise<void> {
    const message = {
      ...encryptedMessage,
      type
    };
    
    const response = await fetch('/api/distribution', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(message)
    });
    
    if (!response.ok) {
      throw new Error(`Échec d'envoi du message de distribution: ${response.status}`);
    }
  }
  
  // Obtenir l'ID de l'utilisateur actuel
  private async getCurrentUserId(): Promise<string> {
    // Cette méthode dépend de votre implémentation
    return (this.sdk as any).userId || "unknown_user";
  }
}