/**
 * Script to clear migratedFromWordPress flag for users who have successfully set passwords
 * 
 * This script should be run once to fix users who already reset their password
 * but still have the migration flag, causing them to be prompted on every login.
 * 
 * Run with: npx tsx scripts/clear-migration-flags.ts
 */

import { createClerkClient } from '@clerk/nextjs/server';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

async function clearMigrationFlags() {
  console.log('🔍 Starting migration flag cleanup...\n');

  try {
    // Get all users (paginated)
    let hasMore = true;
    let offset = 0;
    const limit = 100;
    let totalProcessed = 0;
    let totalCleared = 0;

    while (hasMore) {
      const response = await clerk.users.getUserList({
        limit,
        offset,
      });

      const users = response.data;
      hasMore = response.totalCount > offset + limit;
      offset += limit;

      console.log(`📋 Processing batch of ${users.length} users...`);

      for (const user of users) {
        totalProcessed++;
        
        const publicMetadata = user.publicMetadata as any;
        const email = user.emailAddresses?.[0]?.emailAddress || 'unknown';
        
        // Check if user has the migration flag
        if (publicMetadata?.migratedFromWordPress === true) {
          // Check if user has a password set (passwordEnabled would be true)
          // If they have verified password, they've successfully reset it
          const hasPassword = user.passwordEnabled;
          
          if (hasPassword) {
            console.log(`  ✅ Clearing flag for: ${email} (${user.id})`);
            
            // Remove the migration flag
            // IMPORTANT: updateUserMetadata does a deep MERGE, so omitting a key does NOT delete it.
            // You must explicitly set the key to null to remove it.
            await clerk.users.updateUserMetadata(user.id, {
              publicMetadata: {
                migratedFromWordPress: null,
              },
            });
            
            totalCleared++;
          } else {
            console.log(`  ⏭️  Skipping ${email} - no password set yet`);
          }
        }
      }
    }

    console.log(`\n✅ Cleanup complete!`);
    console.log(`   Total users processed: ${totalProcessed}`);
    console.log(`   Migration flags cleared: ${totalCleared}`);

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

// Run the script
clearMigrationFlags()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
