
import * as crypto from 'crypto';

export function encryptWithSymmetricKey(plaintext: string, key: string): string {
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(key, 'base64');
  
  const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    iv: iv.toString('base64'),
    ciphertext: encrypted,
    tag: authTag.toString('base64')
  });
}

export function decryptWithSymmetricKey(encryptedData: string, key: string): string {
  const { iv, ciphertext, tag } = JSON.parse(encryptedData);
  
  const keyBuffer = Buffer.from(key, 'base64');
  const ivBuffer = Buffer.from(iv, 'base64');
  const tagBuffer = Buffer.from(tag, 'base64');
  
  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBuffer, ivBuffer);
  decipher.setAuthTag(tagBuffer);
  
  let decrypted = decipher.update(ciphertext, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

// Génération d'une clé symétrique sécurisée
export function generateSymmetricKey(): string {
  return crypto.randomBytes(32).toString('base64');
}