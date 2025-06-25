
export interface VerificationManager {
  generateVerificationCode(contactId: string): Promise<string>;
  verifyContact(contactId: string, verificationCode: string): Promise<boolean>;
}

// Implémentation du gestionnaire de vérification
export class E2EEVerificationManager implements VerificationManager {
  private sdk: SecureMessagingSDK;
  
  constructor(sdk: SecureMessagingSDK) {
    this.sdk = sdk;
  }
  
  async generateVerificationCode(contactId: string): Promise<string> {
    try {
      // Récupérer l'appareil principal du contact
      const devices = await this.sdk.getDevicesList(contactId);
      if (devices.length === 0) {
        throw new Error("Aucun appareil trouvé pour ce contact");
      }
      
      // Utiliser le premier appareil pour la vérification
      const deviceId = devices[0];
      
      // Récupérer la clé d'identité du contact
      const contactAddress = new SignalProtocolAddress(contactId, deviceId);
      const contactIdentityKey = await (this.sdk as any).stores.identityKeyStore.getIdentity(contactAddress);
      
      if (!contactIdentityKey) {
        throw new Error("Clé d'identité non trouvée pour ce contact");
      }
      
      // Générer l'empreinte vérifiable
      return this.sdk.generateVerificationFingerprint(contactId, deviceId, contactIdentityKey);
      
    } catch (error) {
      console.error("Erreur lors de la génération du code de vérification:", error);
      throw error;
    }
  }
  
  async verifyContact(contactId: string, userVerificationCode: string): Promise<boolean> {
    try {
      // Générer notre propre code
      const generatedCode = await this.generateVerificationCode(contactId);
      
      // Comparer les codes
      const isVerified = userVerificationCode === generatedCode;
      
      if (isVerified) {
        // Marquer le contact comme vérifié dans notre store
        const devices = await this.sdk.getDevicesList(contactId);
        for (const deviceId of devices) {
          await this.sdk.confirmVerifiedIdentity(contactId, deviceId);
        }
      }
      
      return isVerified;
      
    } catch (error) {
      console.error("Erreur lors de la vérification du contact:", error);
      return false;
    }
  }
}