// Exemple de test unitaire pour vérifier le chiffrement/déchiffrement correct
async function testEncryptionDecryption() {
  // Configurer deux "utilisateurs" pour les tests
  const alice = await setupTestUser("alice");
  const bob = await setupTestUser("bob");
  
  // Établir une session entre Alice et Bob
  const bobPreKeyBundle = await fetchPreKeyBundle(bob.id, 1);
  await alice.establishSession(bob.address, bobPreKeyBundle);
  
  // Alice envoie un message à Bob
  const originalMessage = "Hello, Bob! C'est un message chiffré de bout en bout.";
  const encryptedMessage = await alice.encrypt(bob.address, originalMessage);
  
  // Bob reçoit et déchiffre le message
  const decryptedMessage = await bob.decrypt(alice.address, encryptedMessage);
  
  // Vérifier que le déchiffrement a fonctionné
  assert.strictEqual(decryptedMessage, originalMessage);
}