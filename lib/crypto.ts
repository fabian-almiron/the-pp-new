/**
 * Encryption utilities for sensitive data (like passwords in Stripe metadata)
 * Uses AES-256-GCM for secure encryption
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

// Get encryption key from environment (or use Stripe secret as fallback)
// In production, use a dedicated ENCRYPTION_KEY environment variable
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY || process.env.STRIPE_SECRET_KEY!;
  // Use first 32 bytes of the key (AES-256 requires 32 bytes)
  return Buffer.from(key.slice(0, 32).padEnd(32, '0'));
}

/**
 * Encrypt a string (like a password)
 * Returns: base64-encoded string in format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(16); // Initialization vector
    
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    
    const authTag = cipher.getAuthTag();
    
    // Format: iv:authTag:encryptedData (all base64 encoded)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  } catch (error) {
    console.error('❌ Encryption error:', error);
    throw new Error('Failed to encrypt data');
  }
}

/**
 * Decrypt a string that was encrypted with encrypt()
 * Expects format: iv:authTag:encryptedData
 */
export function decrypt(encryptedText: string): string {
  try {
    const key = getEncryptionKey();
    
    // Parse the encrypted format
    const parts = encryptedText.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(parts[0], 'base64');
    const authTag = Buffer.from(parts[1], 'base64');
    const encrypted = parts[2];
    
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('❌ Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Check if a string is encrypted (has our format)
 */
export function isEncrypted(text: string): boolean {
  return text.includes(':') && text.split(':').length === 3;
}
