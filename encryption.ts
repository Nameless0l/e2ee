// Compléter les fonctions d'encryption et décryption
async function encryptMessage(
  recipientAddress: SignalProtocolAddress, 
  plaintext: string
): Promise<CiphertextMessage> {
  const sessionCipher = new SessionCipher(
    myIdentityKeyStore,
    myPreKeyStore,
    mySignedPreKeyStore,
    mySessionStore,
    recipientAddress
  );
  
  // Convertir le message en bytes
  const plaintextBuffer = stringToArrayBuffer(plaintext);
  
  // Chiffrer le message
  return sessionCipher.encrypt(plaintextBuffer);
}

async function decryptMessage(
  senderAddress: SignalProtocolAddress,
  ciphertext: SignalMessage | PreKeySignalMessage
): Promise<string> {
  const sessionCipher = new SessionCipher(
    myIdentityKeyStore,
    myPreKeyStore,
    mySignedPreKeyStore,
    mySessionStore,
    senderAddress
  );
  
  // Déchiffrer selon le type de message
  let plaintextBuffer;
  
  if (ciphertext instanceof PreKeySignalMessage) {
    plaintextBuffer = await sessionCipher.decryptPreKeyWhisperMessage(ciphertext);
  } else {
    plaintextBuffer = await sessionCipher.decryptWhisperMessage(ciphertext);
  }
  
  // Convertir le buffer en string
  return arrayBufferToString(plaintextBuffer);
}

// Fonction pour formater un message chiffré pour le transport
function formatEncryptedMessage(
  recipientId: string, 
  deviceId: number, 
  ciphertext: CiphertextMessage
): EncryptedMessage {
  const type = ciphertext.getType();
  const body = Buffer.from(ciphertext.serialize()).toString('base64');
  
  return {
    type,
    body,
    recipientId,
    deviceId
  };
}

// Fonction pour parser un message chiffré reçu
function parseEncryptedMessage(encryptedMessage: EncryptedMessage): SignalMessage | PreKeySignalMessage {
  const { type, body } = encryptedMessage;
  const buffer = Buffer.from(body, 'base64');
  
  if (type === CiphertextMessage.PREKEY_TYPE) {
    return new PreKeySignalMessage(buffer);
  } else if (type === CiphertextMessage.WHISPER_TYPE) {
    return new SignalMessage(buffer);
  } else {
    throw new Error(`Type de message non pris en charge: ${type}`);
  }
}

// Ajouter des fonctions utilitaires pour les conversions entre string et ArrayBuffer
function stringToArrayBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

function arrayBufferToString(buffer: ArrayBuffer): string {//convertur un buffer en string
  const decoder = new TextDecoder('utf-8');
  return decoder.decode(new Uint8Array(buffer));
}