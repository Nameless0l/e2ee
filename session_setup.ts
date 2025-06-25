async function fetchPreKeyBundle(
  userId: string, 
  deviceId: number
): Promise<PreKeyBundle> {
  // Appel API vers le serveur pour récupérer le bundle de préclés
  const response = await fetch(`/api/prekey-bundle/${userId}/${deviceId}`);
  
  if (!response.ok) {
    throw new Error(`Échec de récupération du bundle de préclés: ${response.status}`);
  }
  
  const bundle = await response.json();
  
  return new PreKeyBundle(
    bundle.registrationId,
    bundle.deviceId,
    bundle.preKeyId,
    bundle.preKeyPublic ? new PublicKey(Buffer.from(bundle.preKeyPublic, 'base64')) : undefined,
    bundle.signedPreKeyId,
    new PublicKey(Buffer.from(bundle.signedPreKeyPublic, 'base64')),
    Buffer.from(bundle.signedPreKeySignature, 'base64'),
    new IdentityKey(Buffer.from(bundle.identityKey, 'base64'))
  );
}

async function establishOutgoingSession(
  recipientAddress: SignalProtocolAddress,
  preKeyBundle: PreKeyBundle
): Promise<void> {
  // Crée une session de sortie (outgoing) avec un destinataire
  const sessionBuilder = new SessionBuilder(
    myIdentityKeyStore,
    myPreKeyStore,
    mySignedPreKeyStore,
    mySessionStore,
    recipientAddress
  );
  
  await sessionBuilder.processPreKeyBundle(preKeyBundle);
}

async function processIncomingPreKeyMessage(
  senderAddress: SignalProtocolAddress,
  preKeyMessage: PreKeySignalMessage
): Promise<PlainTextBuffer> {
  // Traite un message préclé entrant (établit la session si elle n'existe pas)
  const sessionCipher = new SessionCipher(
    myIdentityKeyStore,
    myPreKeyStore,
    mySignedPreKeyStore,
    mySessionStore,
    senderAddress
  );
  
  return sessionCipher.decryptPreKeyWhisperMessage(preKeyMessage);
}