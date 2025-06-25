// Types partagés pour la messagerie chiffrée

export interface EncryptedMessage {
  type: number;
  body: string;
  recipientId: string;
  deviceId: number;
}

export interface UserKeys {
  identityKey: PublicKey;
  registrationId: number;
  preKeys: Array<{ id: number, key: PublicKey }>;
  signedPreKey: {
    id: number,
    key: PublicKey,
    signature: Buffer
  };
}

// Autres types utiles pour la messagerie