import { createCipheriv, createDecipheriv, scryptSync, randomBytes } from 'crypto';
import { config } from '../config';

// Derive a 32-byte key from the ENCRYPTION_KEY using scrypt (secure key derivation)
const key = scryptSync(config.ENCRYPTION_KEY, 'bonkbot-salt', 32); // Use a unique salt; change if needed

export function encrypt(text: string): string {
  const iv = randomBytes(16); // Generate a random 16-byte IV for each encryption
  const cipher = createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Prefix the encrypted data with the IV (32 hex characters) for decryption
  return iv.toString('hex') + encrypted;
}

export function decrypt(encrypted: string): string {
  try {
    // New method: Expect IV prefix (first 32 hex chars = 16 bytes)
    if (encrypted.length < 32) throw new Error('Invalid encrypted data length');
    const ivHex = encrypted.slice(0, 32);
    const encryptedData = encrypted.slice(32);
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    // Fallback to old deprecated method for backward compatibility
    console.warn('Falling back to deprecated decryption method for old data');
    const { createDecipher } = require('crypto'); // Import here to avoid deprecation warnings
    const decipher = createDecipher('aes-256-cbc', config.ENCRYPTION_KEY);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}