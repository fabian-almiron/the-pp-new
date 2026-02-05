/**
 * Test script to verify password encryption/decryption works correctly
 * Run with: npx tsx scripts/test-encryption.ts
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Try to load .env.local first, then .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

// Verify we have the required environment variable
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ Error: STRIPE_SECRET_KEY not found in environment');
  console.error('Please make sure .env.local exists and contains STRIPE_SECRET_KEY');
  process.exit(1);
}

import { encrypt, decrypt, isEncrypted } from '../lib/crypto';

console.log('🧪 Testing password encryption/decryption...\n');

// Test passwords
const testPasswords = [
  'SimplePassword123',
  'Complex!P@ssw0rd#2024',
  'emoji-password-🔒-test',
  'very-long-password-' + 'x'.repeat(100),
];

let allTestsPassed = true;

for (const originalPassword of testPasswords) {
  console.log(`Testing: "${originalPassword.slice(0, 30)}${originalPassword.length > 30 ? '...' : ''}"`);
  
  try {
    // Encrypt
    const encrypted = encrypt(originalPassword);
    console.log(`  ✅ Encrypted: ${encrypted.slice(0, 50)}...`);
    
    // Check if detected as encrypted
    if (!isEncrypted(encrypted)) {
      console.error('  ❌ Failed: isEncrypted() returned false');
      allTestsPassed = false;
      continue;
    }
    console.log('  ✅ Detected as encrypted');
    
    // Decrypt
    const decrypted = decrypt(encrypted);
    console.log(`  ✅ Decrypted: ${decrypted.slice(0, 30)}${decrypted.length > 30 ? '...' : ''}`);
    
    // Verify match
    if (originalPassword === decrypted) {
      console.log('  ✅ Match: Original === Decrypted\n');
    } else {
      console.error('  ❌ Failed: Passwords do not match');
      console.error(`     Original:  ${originalPassword}`);
      console.error(`     Decrypted: ${decrypted}\n`);
      allTestsPassed = false;
    }
  } catch (error: any) {
    console.error(`  ❌ Error: ${error.message}\n`);
    allTestsPassed = false;
  }
}

// Test backwards compatibility (non-encrypted strings)
console.log('Testing backwards compatibility (non-encrypted strings)...');
const plainText = 'NotEncryptedPassword';
if (isEncrypted(plainText)) {
  console.error('  ❌ Failed: Plain text detected as encrypted');
  allTestsPassed = false;
} else {
  console.log('  ✅ Plain text correctly identified as not encrypted\n');
}

// Test encryption produces different output for same input (due to random IV)
console.log('Testing encryption randomness (same input should produce different output)...');
const password = 'TestPassword123';
const encrypted1 = encrypt(password);
const encrypted2 = encrypt(password);
if (encrypted1 === encrypted2) {
  console.error('  ❌ Failed: Same input produced identical encrypted output');
  console.error('     This is a security issue - encryption should use random IVs');
  allTestsPassed = false;
} else {
  console.log('  ✅ Same input produced different encrypted output (good!)');
  console.log(`     Encrypted 1: ${encrypted1.slice(0, 40)}...`);
  console.log(`     Encrypted 2: ${encrypted2.slice(0, 40)}...`);
  
  // But both should decrypt to the same value
  const decrypted1 = decrypt(encrypted1);
  const decrypted2 = decrypt(encrypted2);
  if (decrypted1 === password && decrypted2 === password) {
    console.log('  ✅ Both decrypt to original password\n');
  } else {
    console.error('  ❌ Failed: Decryption mismatch');
    allTestsPassed = false;
  }
}

// Summary
console.log('─'.repeat(60));
if (allTestsPassed) {
  console.log('✅ All tests passed! Encryption is working correctly.');
  console.log('\nYou can now safely deploy:');
  console.log('  1. Passwords will be encrypted in Stripe metadata');
  console.log('  2. Webhooks will decrypt them before creating Clerk accounts');
  console.log('  3. Auto-login will still work (uses tokens, not passwords)');
  process.exit(0);
} else {
  console.error('❌ Some tests failed. Please check the errors above.');
  process.exit(1);
}
