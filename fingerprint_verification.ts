// Génération d'empreintes numériques pour la vérification manuelle par les utilisateurs
async function generateFingerprint(
  myIdentity: IdentityKey,
  theirIdentity: IdentityKey,
  myName: string,
  theirName: string
): Promise<Fingerprint> {
  // Génère une empreinte numérique que les utilisateurs peuvent comparer
  return new NumericFingerprint(
    5,  // Itérations
    5,  // Taille de l'empreinte numérique
    myIdentity.getPublicKey().serialize(),
    theirIdentity.serialize()
  ).getDisplayString();
}