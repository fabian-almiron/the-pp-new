# WordPress to Clerk Migration Plan

## 📋 Table of Contents
1. [Overview](#overview)
2. [The Challenge](#the-challenge)
3. [Recommended Strategy: Dual Authentication](#recommended-strategy-dual-authentication)
4. [Migration Phases](#migration-phases)
5. [Technical Implementation](#technical-implementation)
6. [Email Templates](#email-templates)
7. [Timeline](#timeline)
8. [Post-Migration](#post-migration)

---

## Overview

This document outlines the strategy for migrating users from WordPress OAuth (MD5-based) to Clerk authentication for The Piped Peony website.

**Key Challenge:** WordPress uses MD5 password hashing with salt, which cannot be directly migrated to Clerk's modern bcrypt-based authentication.

**Solution:** Implement a dual authentication system with a gradual migration that allows users to transition without forced password resets initially.

---

## The Challenge

### Why Direct Migration Isn't Possible

1. **Password Hashing Incompatibility:**
   - WordPress: MD5 with salt (insecure)
   - Clerk: Modern bcrypt/argon2 (secure)
   - MD5 hashes cannot be converted to bcrypt

2. **Security Concerns:**
   - MD5 is cryptographically broken
   - Cannot reverse-engineer original passwords
   - Clerk won't accept MD5 hashes

3. **User Experience:**
   - Direct migration = forced password resets for ALL users
   - Potential customer support burden
   - Risk of user frustration and churn

### Available Migration Options

| Option | Pros | Cons | Recommendation |
|-------|------|------|---------------|
| **Password Reset (Simple)** | Easiest to implement | All users must reset | ⭐ Good for small user base |
| **Trickle Migration** | Users migrate gradually | Requires custom code | ⭐⭐⭐ Best for active users |
| **Dual Auth** | No disruption initially | Complex setup | ⭐⭐⭐⭐ Best overall |
| **OAuth-Only** | Most secure | Users must reset | ⭐⭐ Good as backup |

---

## Recommended Strategy: Dual Authentication

### What is Dual Authentication?

Run both WordPress and Clerk authentication **in parallel** during a transition period. Users can authenticate through either system, with new users automatically added to Clerk.

### Benefits

✅ **No Immediate Disruption**  
- Existing users continue with WordPress auth  
- New users start with Clerk  
- Zero downtime migration  

✅ **Gradual Migration**  
- Migrate active users first  
- Inactive users handled later  
- Lower support burden  

✅ **Easy Rollback**  
- WordPress system remains active  
- Can revert if issues arise  
- Test Clerk with real traffic  

✅ **Better UX**  
- Users choose when to migrate  
- No forced password resets initially  
- OAuth options reduce friction  

---

## Migration Phases

### Phase 1: Setup (Week 1)

**Goal:** Enable dual authentication system

**Tasks:**
1. ✅ Clerk already installed on Next.js app
2. Keep WordPress authentication active
3. Configure middleware to check both systems
4. Set up user import script
5. Create Mailchimp/SendGrid integration

**Configuration:**

```typescript
// middleware.ts (updated for dual auth)
import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  const pathname = req.nextUrl.pathname;
  
  // Check if user is authenticated via Clerk
  const isClerkAuthenticated = !!userId;
  
  // Check if user has WordPress session (via cookie/header)
  const wpSession = req.cookies.get('wordpress_logged_in');
  const isWordPressAuthenticated = !!wpSession;
  
  // Protect routes if authenticated via either system
  if (isProtectedRoute(req)) {
    if (!isClerkAuthenticated && !isWordPressAuthenticated) {
      // Redirect to login
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect_url', pathname);
      return NextResponse.redirect(url);
    }
  }
  
  return NextResponse.next();
});
```

### Phase 2: Announcement & Early Migration (Week 1-2)

**Goal:** Notify users and start voluntary migration

**Tasks:**
1. Send email to all WordPress users (via WordPress/Mailchimp)
2. Update login page to show dual options
3. Create incentive for early adopters
4. Monitor migration rate

**Email Template (See Section 6)**

### Phase 3: Active User Migration (Week 2-4)

**Goal:** Migrate active users with "trickle" approach

**How it Works:**
1. User attempts to login on WordPress site
2. Backend checks: Is user in Clerk?
3. If not, authenticate via WordPress
4. Create user in Clerk automatically
5. Prompt for password reset (one-time)
6. User completes migration

**Implementation:**

```typescript
// Example: Dual Authentication Handler
// File: app/api/auth/hybrid-auth.ts (TO BE CREATED)

import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { verifyWordPressPassword } from '@/lib/wordpress-auth';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  try {
    // Step 1: Check if user exists in Clerk
    const clerkUsers = await clerkClient.users.getUserList({
      emailAddress: [email],
      limit: 1
    });
    
    const userExistsInClerk = clerkUsers.length > 0;
    
    if (userExistsInClerk) {
      // User already migrated - authenticate via Clerk
      return NextResponse.json({ 
        provider: 'clerk',
        userId: clerkUsers[0].id 
      });
    }
    
    // Step 2: Authenticate via WordPress
    const wpUser = await verifyWordPressPassword(email, password);
    
    if (!wpUser) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Step 3: Create user in Clerk with temp password
    const newClerkUser = await clerkClient.users.createUser({
      emailAddress: [email],
      username: wpUser.username,
      firstName: wpUser.first_name,
      lastName: wpUser.last_name,
      password: generateSecurePassword(), // Strong temp password
      publicMetadata: {
        migratedFromWordPress: true,
        wpUserId: wpUser.id,
        migrationDate: new Date().toISOString(),
        requiresPasswordReset: true,
      },
      skipPasswordChecks: false,
    });
    
    // Step 4: Send password reset email via Clerk
    await clerkClient.emailAddresses.createEmailAddress({
      userId: newClerkUser.id,
      emailAddress: email,
    });
    
    await clerkClient.users.sendPasswordResetEmail({
      userId: newClerkUser.id,
      strategy: 'email_code',
    });
    
    return NextResponse.json({
      provider: 'migrated',
      userId: newClerkUser.id,
      message: 'Account migrated! Please check your email to reset your password.',
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed' },
      { status: 500 }
    );
  }
}

function generateSecurePassword(): string {
  // Generate strong temporary password
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         '!@#' + 
         Math.floor(Math.random() * 1000);
}
```

### Phase 4: Bulk Import (Week 4-5)

**Goal:** Import all remaining users

**Script:**

```typescript
// File: scripts/bulk-import-users.ts (TO BE CREATED)
import { clerkClient } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma'; // Your database
import * as bcrypt from 'bcryptjs';

async function bulkImportWordPressUsers() {
  console.log('🚀 Starting bulk import...');
  
  // Export users from WordPress database
  const wpUsers = await prisma.$queryRaw`
    SELECT 
      id,
      user_email as email,
      user_login as username,
      display_name,
      user_registered
    FROM wp_users
    WHERE user_email IS NOT NULL
  `;
  
  console.log(`📊 Found ${wpUsers.length} users to import`);
  
  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];
  
  for (const user of wpUsers) {
    try {
      // Check if user already exists in Clerk
      const existing = await clerkClient.users.getUserList({
        emailAddress: [user.email],
        limit: 1
      });
      
      if (existing.length > 0) {
        console.log(`⏭️  Skipping ${user.email} (already exists)`);
        continue;
      }
      
      // Create user in Clerk without password
      const clerkUser = await clerkClient.users.createUser({
        emailAddress: [user.email],
        username: user.username,
        publicMetadata: {
          migratedFromWordPress: true,
          wpUserId: user.id,
          migrationDate: new Date().toISOString(),
          bulkImport: true,
        },
        skipPasswordChecks: true, // Will force password reset
      });
      
      // Generate password reset token
      const resetToken = await clerkClient.users.createPasswordResetToken({
        userId: clerkUser.id,
      });
      
      // Send migration email via your email service
      await sendMigrationEmail(user.email, {
        clerkUserId: clerkUser.id,
        resetToken: resetToken.token,
      });
      
      successCount++;
      console.log(`✅ Imported: ${user.email} (${successCount}/${wpUsers.length})`);
      
    } catch (error) {
      errorCount++;
      errors.push({ email: user.email, error: error.message });
      console.error(`❌ Failed: ${user.email}`, error);
    }
    
    // Rate limiting: don't hammer Clerk API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('\n📊 Import Summary:');
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:');
    errors.forEach(e => console.log(`  - ${e.email}: ${e.error}`));
  }
}

async function sendMigrationEmail(email: string, data: any) {
  // Integrate with your email service (Mailchimp, SendGrid, etc.)
  // This is a placeholder
  await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{
        to: [{ email }],
        subject: 'Action Required: Complete Your Account Migration'
      }],
      from: { email: 'noreply@pipedpeony.com' },
      content: [{
        type: 'text/html',
        value: `
          <h2>Welcome to The New Piped Peony!</h2>
          <p>We've migrated your account to our new secure authentication system.</p>
          <p>To continue accessing your account, please set a new password:</p>
          <a href="https://pipedpeony.com/reset?token=${data.resetToken}">
            Set Your Password
          </a>
          <p>Or use Google/Apple OAuth for faster sign-in!</p>
        `
      }]
    })
  });
}

// Run the import
bulkImportWordPressUsers()
  .then(() => {
    console.log('✅ Bulk import complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Bulk import failed:', error);
    process.exit(1);
  });
```

### Phase 5: Final Migration (Week 5-6)

**Goal:** Disable WordPress authentication

**Tasks:**
1. Monitor migration completion rate
2. Send final reminder to remaining users
3. Disable WordPress authentication
4. Keep WordPress database for reference (read-only)
5. Celebrate! 🎉

---

## Technical Implementation

### 1. Hybrid Authentication Checker

Create a utility to check both systems:

```typescript
// File: lib/auth-checker.ts (TO BE CREATED)

import { clerkClient } from '@clerk/nextjs/server';
import { cookies } from 'next/headers';

export async function checkUserAuthentication(email: string) {
  // Check Clerk
  const clerkUser = await clerkClient.users.getUserList({
    emailAddress: [email],
    limit: 1
  });
  
  if (clerkUser.length > 0) {
    return {
      authenticated: true,
      provider: 'clerk',
      userId: clerkUser[0].id,
      requiresMigration: false,
    };
  }
  
  // Check WordPress session
  const cookieStore = await cookies();
  const wpSession = cookieStore.get('wordpress_logged_in');
  
  if (wpSession) {
    return {
      authenticated: true,
      provider: 'wordpress',
      userId: wpSession.value,
      requiresMigration: true,
    };
  }
  
  return {
    authenticated: false,
    provider: null,
    userId: null,
    requiresMigration: false,
  };
}
```

### 2. User Database Migration

Track migration status in your database:

```sql
-- Add migration tracking to user table
ALTER TABLE users ADD COLUMN migrated_to_clerk BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN clerk_user_id VARCHAR(255);
ALTER TABLE users ADD COLUMN migration_date TIMESTAMP;
ALTER TABLE users ADD COLUMN requires_password_reset BOOLEAN DEFAULT TRUE;
```

### 3. WordPress Integration Script

If you need to verify passwords against WordPress:

```typescript
// File: lib/wordpress-auth.ts (TO BE CREATED)

import * as crypto from 'crypto';

export async function verifyWordPressPassword(
  email: string, 
  password: string
): Promise<boolean> {
  // Query WordPress user from database
  const user = await prisma.$queryRaw`
    SELECT user_pass, user_email 
    FROM wp_users 
    WHERE user_email = ${email}
    LIMIT 1
  `;
  
  if (!user || user.length === 0) {
    return false;
  }
  
  const wpHash = user[0].user_pass;
  
  // Check hash format: $P$B (MD5) or $2y$ (bcrypt)
  if (wpHash.startsWith('$P$')) {
    // MD5-based hash (Portable PHP hash)
    return verifyMD5Hash(password, wpHash);
  } else if (wpHash.startsWith('$2y$') || wpHash.startsWith('$2a$')) {
    // Modern bcrypt hash
    return await verifyBcryptHash(password, wpHash);
  }
  
  return false;
}

function verifyMD5Hash(password: string, hash: string): boolean {
  // WordPress MD5 implementation
  // Format: $P$B12345678901234567890123456789
  const parts = hash.split('$');
  if (parts.length < 3) return false;
  
  const count = Math.pow(2, 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789./'.indexOf(parts[2][0]));
  const salt = parts[2].substring(1, 9);
  const realHash = parts[2].substring(9);
  
  let md5Hash = crypto.createHash('md5').update(salt + password).digest('hex');
  
  for (let i = 0; i < count; i++) {
    md5Hash = crypto.createHash('md5').update(md5Hash + password).digest('hex');
  }
  
  return md5Hash === realHash;
}

async function verifyBcryptHash(password: string, hash: string): Promise<boolean> {
  // Use bcrypt library for modern WordPress hashes
  const bcrypt = require('bcryptjs');
  return await bcrypt.compare(password, hash);
}
```

---

## Email Templates

### Email 1: Pre-Migration Announcement (Week 1)

**Subject:** We're Upgrading Your Account Security! 🔒

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background-color: #f4f1e6; padding: 20px; text-align: center; }
    .content { padding: 20px; background-color: #fff; }
    .button { display: inline-block; padding: 12px 24px; background-color: #8B4513; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
    .footer { font-size: 12px; color: #666; margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>The Piped Peony</h1>
    </div>
    <div class="content">
      <h2>Hi [Name],</h2>
      
      <p>We're excited to tell you about an important upgrade to your Piped Peony account!</p>
      
      <h3>What's Changing? ✨</h3>
      <ul>
        <li><strong>Better Security:</strong> We're upgrading to modern password encryption</li>
        <li><strong>Faster Sign-In:</strong> Use Google, Apple, or Facebook to log in instantly</li>
        <li><strong>Improved Experience:</strong> Streamlined account management</li>
      </ul>
      
      <h3>When Does This Happen?</h3>
      <p>We'll be rolling this out over the next few weeks. You don't need to do anything right now—we'll send you another email when it's time to migrate your account.</p>
      
      <h3>Will This Affect My Account?</h3>
      <p>No! All your orders, courses, and data will remain exactly the same. The only difference will be how you sign in.</p>
      
      <h3>Questions?</h3>
      <p>If you have any concerns, just reply to this email or visit our support center.</p>
      
      <p>Thanks for being a valued member of The Piped Peony community!</p>
      
      <p>Best regards,<br>The Piped Peony Team</p>
    </div>
    <div class="footer">
      <p>The Piped Peony • pipedpeony.com</p>
      <p>You're receiving this email because you have an account with us.</p>
    </div>
  </div>
</body>
</html>
```

### Email 2: Migration Invitation (Week 2-4)

**Subject:** Ready to Upgrade? Migrate Your Account Now for Early Access! 🎁

```html
<!-- Similar structure to Email 1 -->
<h2>Hi [Name],</h2>

<p>Your account migration is ready! Complete it now and enjoy:</p>

<ul>
  <li>🎁 Early access to new features</li>
  <li>⚡ Instant Google/Apple sign-in</li>
  <li>🔒 Enhanced security</li>
</ul>

<a href="https://pipedpeony.com/migrate?email=[email]" class="button">
  Migrate My Account Now
</a>

<p><small>Takes less than 2 minutes</small></p>

<p>Or migrate later—we'll send you another reminder in a few days.</p>
```

### Email 3: Final Notice (Week 4-5)

**Subject:** Action Required: Complete Your Account Migration 📋

```html
<!-- Similar structure to Email 1 -->
<h2>Hi [Name],</h2>

<p><strong>Your account migration is due within 7 days.</strong></p>

<p>To continue accessing The Piped Peony, please complete your account migration by [DATE].</p>

<a href="https://pipedpeony.com/migrate?email=[email]" class="button">
  Complete Migration
</a>

<h3>What You'll Need:</h3>
<ul>
  <li>3 minutes</li>
  <li>Your email address</li>
  <li>To set a new password (or use Google/Apple)</li>
</ul>

<p><strong>Need Help?</strong> Reply to this email and we'll assist you.</p>

<p>Thanks,<br>The Piped Peony Team</p>
```

### Email 4: Password Reset for Bulk Import (Week 4-5)

**Subject:** Your Account Has Been Migrated - Set Your New Password 🔐

```html
<h2>Hi [Name],</h2>

<p>Great news! We've successfully migrated your account to our new secure system.</p>

<p><strong>Next Step:</strong> Set your new password to access your account.</p>

<a href="https://pipedpeony.com/reset?token=[token]" class="button">
  Set My Password
</a>

<p><strong>Or</strong> sign in with Google/Apple for instant access (no password needed!).</p>

<h3>What's New?</h3>
<ul>
  <li>✅ Stronger password encryption</li>
  <li>✅ Faster sign-in with social login</li>
  <li>✅ Same great experience, better security</li>
</ul>

<p>All your orders, courses, and data are safe and waiting for you!</p>

<p>Thanks,<br>The Piped Peony Team</p>
```

---

## Timeline

```
┌─────────────────────────────────────────────────────────────┐
│ Week 1: Setup & Announcement                                │
│ ✅ Set up dual authentication                               │
│ ✅ Send announcement email to all users                     │
│ ✅ Monitor user feedback                                    │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Week 2-4: Active User Migration                            │
│ ✅ Migrate users as they log in                            │
│ ✅ Send weekly migration invitations                        │
│ ✅ Track migration rate                                     │
│ ✅ Monitor support tickets                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Week 4-5: Bulk Import Remaining Users                       │
│ ✅ Export inactive users from WordPress                     │
│ ✅ Bulk import to Clerk                                     │
│ ✅ Send password reset emails                               │
│ ✅ Send final migration reminders                          │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Week 5-6: Final Migration                                   │
│ ✅ Disable WordPress authentication                        │
│ ✅ Monitor for issues                                       │
│ ✅ Keep WordPress DB as read-only backup                    │
│ ✅ Celebrate successful migration! 🎉                      │
└─────────────────────────────────────────────────────────────┘
```

---

## Post-Migration

### Database Cleanup

After successful migration:

```sql
-- Mark all WordPress users as migrated (if needed)
UPDATE users SET 
  migrated_to_clerk = TRUE,
  migration_date = NOW()
WHERE clerk_user_id IS NOT NULL;

-- Archive WordPress tables (rename, don't delete)
RENAME TABLE wp_users TO wp_users_archive_2025_01;
RENAME TABLE wp_usermeta TO wp_usermeta_archive_2025_01;
```

### Analytics

Track migration success:

```typescript
// Track migration metrics
const metrics = {
  totalUsers: 0,
  migratedUsers: 0,
  migrationRate: 0,
  avgMigrationTime: 0,
};

// Query from your database
async function generateMigrationReport() {
  const totalUsers = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM users
  `;
  
  const migratedUsers = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM users WHERE migrated_to_clerk = TRUE
  `;
  
  return {
    total: totalUsers[0].count,
    migrated: migratedUsers[0].count,
    percentage: (migratedUsers[0].count / totalUsers[0].count) * 100,
  };
}
```

---

## Key Considerations

### Security
- ✅ Clerk uses bcrypt (secure) vs WordPress MD5 (insecure)
- ✅ OAuth reduces password dependency
- ✅ All passwords reset during migration
- ✅ MFA available post-migration

### User Experience
- ✅ No forced immediate password resets
- ✅ Gradual migration reduces support burden
- ✅ OAuth options for quick sign-in
- ✅ Email templates for clear communication

### Technical
- ✅ Dual authentication during transition
- ✅ Easy rollback if issues arise
- ✅ WordPress DB retained as backup
- ✅ Webhooks for real-time syncing

### Support
- ✅ Pre-written email templates
- ✅ Clear migration instructions
- ✅ Support tickets tracking
- ✅ Analytics dashboard

---

## Resources

- **Clerk Dashboard:** https://dashboard.clerk.com
- **Clerk API Docs:** https://clerk.com/docs/reference/backend-api
- **Migration Guide:** https://clerk.com/docs/guides/development/migrating/overview
- **Your Project Structure:** See `CLERK_AUTH_SETUP.md` for current implementation

---

## Success Metrics

Track these KPIs:

1. **Migration Rate:** % of users migrated
2. **Time to Migrate:** Average days to complete
3. **Support Tickets:** Number of migration-related issues
4. **User Feedback:** Satisfaction with new system
5. **Login Success Rate:** % of successful logins post-migration

Targets:
- ✅ 80% migrated within 4 weeks
- ✅ <5% support tickets
- ✅ 95%+ login success rate
- ✅ Positive user feedback

---

## Notes

- This plan assumes you're migrating from a custom WordPress implementation
- Adjust timelines based on your user base size
- Test thoroughly in staging before production
- Keep WordPress database for 90 days post-migration
- Monitor Clerk dashboard for unusual activity

**Questions?** See existing documentation:
- `CLERK_AUTH_SETUP.md` - Current Clerk setup
- `CLERK_METADATA_SETUP.md` - User roles setup
- `STRIPE_SETUP.md` - Payment integration (related)

---

*Last updated: [Date]*

