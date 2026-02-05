# Password Security Fix

## The Problem (Before)

Passwords were stored in **plain text** in Stripe checkout session metadata:

```json
{
  "metadata": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "MySecretPassword123"  // ❌ VISIBLE IN STRIPE DASHBOARD
  }
}
```

**Security Issues:**
- ❌ Visible to anyone with Stripe dashboard access
- ❌ Stored in Stripe webhooks/logs
- ❌ Visible in Stripe API calls
- ❌ Could be intercepted if logged

## The Solution (After)

Passwords are now **encrypted** (AES-256-GCM) before storage:

```json
{
  "metadata": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "password": "aB3xK9...encrypted_data...pL7z"  // ✅ ENCRYPTED
  }
}
```

**Security Benefits:**
- ✅ Not readable in Stripe dashboard
- ✅ Cannot be decrypted without your secret key
- ✅ Authenticated encryption prevents tampering
- ✅ Random IV (different output each time)
- ✅ Only your webhook can decrypt it

## How It Works

### Step 1: User Signs Up (Frontend)
```typescript
// User enters password in signup form
const password = "MySecretPassword123";

// Send to your API
POST /api/guest-checkout
{
  "email": "john@example.com",
  "password": "MySecretPassword123"  // Still plain text in transit (over HTTPS)
}
```

### Step 2: Create Checkout (Your API)
```typescript
// Import encryption utility
import { encrypt } from '@/lib/crypto';

// Encrypt password before storing
const encryptedPassword = encrypt(password);
// Result: "iv:authTag:encryptedData" (base64 encoded)

// Store encrypted version in Stripe
await stripe.checkout.sessions.create({
  metadata: {
    password: encryptedPassword  // ✅ Encrypted
  }
});
```

**What's stored in Stripe:**
```
password: "nK3xL9pM4qR7+...encrypted...+zY6wV2=="
```

### Step 3: Webhook Receives Payment (Your Server)
```typescript
// Import decryption utility
import { decrypt } from '@/lib/crypto';

// Get encrypted password from Stripe
const encryptedPassword = session.metadata.password;

// Decrypt it
const password = decrypt(encryptedPassword);
// Result: "MySecretPassword123" (original password)

// Use plain password to create Clerk account
await clerkClient.users.createUser({
  email: user.email,
  password: password  // Clerk will hash it again
});
```

### Step 4: Auto-Login (No Password Needed!)
```typescript
// Auto-login uses sign-in tokens, not passwords
const token = await clerkClient.signInTokens.createSignInToken({
  userId: user.id
});

// User is logged in without needing their password
await signIn.create({
  strategy: 'ticket',
  ticket: token
});
```

## Encryption Details

### Algorithm: AES-256-GCM
- **AES-256**: Industry-standard symmetric encryption
- **GCM**: Galois/Counter Mode (authenticated encryption)
- **Key Size**: 256 bits (32 bytes)
- **IV**: Random 16-byte initialization vector (unique per encryption)
- **Auth Tag**: 16-byte authentication tag (prevents tampering)

### Format
Encrypted passwords are stored as base64-encoded strings:
```
<iv>:<authTag>:<encryptedData>
```

Example:
```
nK3xL9pM4qR7sT8u:vW1yX2zA3bB4cC5d:dD6eE7fF8gG9hH0iI1j...
```

### Key Management
The encryption key is derived from your environment variables:
1. First choice: `ENCRYPTION_KEY` (if set)
2. Fallback: First 32 bytes of `STRIPE_SECRET_KEY`

**Recommendation**: Set a dedicated `ENCRYPTION_KEY` in production:
```bash
# Generate a strong random key
openssl rand -base64 32

# Add to your environment
ENCRYPTION_KEY=<generated-key>
```

## Testing

Test the encryption/decryption:
```bash
pnpm run test-encryption
```

This verifies:
- ✅ Encryption produces random output (different each time)
- ✅ Decryption recovers original password
- ✅ Works with various password formats
- ✅ Handles special characters, emojis, long passwords

## Security Comparison

### Before (Plain Text)
```
User Password: "MyPassword123"
        ↓
Sent to API (HTTPS - secure in transit)
        ↓
Stored in Stripe: "MyPassword123" ❌ PLAIN TEXT
        ↓
Visible in Stripe Dashboard ❌
        ↓
Webhook receives: "MyPassword123"
        ↓
Create Clerk account
```

### After (Encrypted)
```
User Password: "MyPassword123"
        ↓
Sent to API (HTTPS - secure in transit)
        ↓
Encrypted: "nK3xL9pM...encrypted..." ✅
        ↓
Stored in Stripe: "nK3xL9pM...encrypted..." ✅ ENCRYPTED
        ↓
Not readable in Stripe Dashboard ✅
        ↓
Webhook receives: "nK3xL9pM...encrypted..."
        ↓
Decrypted: "MyPassword123" (only in your code)
        ↓
Create Clerk account
```

## FAQ

### Q: Can Stripe employees see the password?
**Before**: Yes, they could see plain text passwords  
**After**: No, they only see encrypted gibberish

### Q: What if someone gets access to Stripe dashboard?
**Before**: They'd see all passwords in plain text  
**After**: They'd only see encrypted data (useless without your key)

### Q: Does this affect auto-login?
**No!** Auto-login uses Clerk's sign-in tokens, not passwords. It works exactly the same.

### Q: What if I lose my encryption key?
- Existing encrypted passwords can't be decrypted
- New signups won't work (can't decrypt to create Clerk accounts)
- **Solution**: Keep your `ENCRYPTION_KEY` backed up securely
- Users can always use "Forgot Password" to reset

### Q: Is this backwards compatible?
**Yes!** The code checks if data is encrypted:
```typescript
if (isEncrypted(data)) {
  password = decrypt(data);  // New encrypted format
} else {
  password = data;  // Old plain text (legacy)
}
```

Old plain-text passwords will still work (until they're replaced with new encrypted signups).

### Q: Should I rotate the encryption key?
- Not necessary unless key is compromised
- If you rotate, old passwords can't be decrypted
- Only do this if you have a security breach

### Q: What about passwords in logs?
The encrypted password may appear in logs, but that's fine - it's encrypted. However, you should still:
- Avoid logging the decrypted password
- Use log filtering to redact sensitive data
- Keep logs secure

## Environment Variables

### Required
```bash
# Used for encryption if ENCRYPTION_KEY not set
STRIPE_SECRET_KEY=sk_...
```

### Recommended
```bash
# Dedicated encryption key (more secure)
ENCRYPTION_KEY=<base64-encoded-32-byte-key>
```

Generate with:
```bash
openssl rand -base64 32
```

## Files Changed

- ✅ `lib/crypto.ts` - New encryption utilities
- ✅ `app/api/guest-checkout/route.ts` - Encrypts password before storage
- ✅ `app/api/stripe-webhook/route.ts` - Decrypts password when creating account
- ✅ `scripts/test-encryption.ts` - Test suite for encryption

## Summary

**What changed:**
- Passwords are encrypted (AES-256-GCM) before storing in Stripe
- Webhooks decrypt them to create Clerk accounts
- Auto-login still works (uses tokens, not passwords)

**Security level:**
- Before: ❌ Anyone with Stripe access sees passwords
- After: ✅ Only your server can decrypt passwords

**User experience:**
- No change - users don't notice anything different
- Auto-login works exactly the same

**Next steps:**
1. Test encryption: `pnpm run test-encryption`
2. Deploy the changes
3. (Optional) Set dedicated `ENCRYPTION_KEY` environment variable
