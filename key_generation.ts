async function generateIdentityKeyPair(): Promise<IdentityKeyPair> {
  // Génère une paire de clés d'identité (clé à long terme)
  return KeyHelper.generateIdentityKeyPair();
}

async function generateRegistrationId(): Promise<number> {
  // Génère un ID d'enregistrement unique (entier sur 14 bits)
  return KeyHelper.generateRegistrationId();
}

async function generatePreKeys(startId: number, count: number): Promise<PreKeyRecord[]> {
  // Génère un lot de clés préchargées
  return KeyHelper.generatePreKeys(startId, count);
}

async function generateSignedPreKey(identityKeyPair: IdentityKeyPair, keyId: number): Promise<SignedPreKeyRecord> {
  // Génère une clé préchargée signée
  return KeyHelper.generateSignedPreKey(identityKeyPair, keyId);
}