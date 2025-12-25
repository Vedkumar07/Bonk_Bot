import { createCipher, createDecipher } from 'crypto';
import { config } from '../config';

export function encrypt(text: string): string {
  const cipher = createCipher('aes-256-cbc', config.ENCRYPTION_KEY);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

export function decrypt(encrypted: string): string {
  const decipher = createDecipher('aes-256-cbc', config.ENCRYPTION_KEY);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}