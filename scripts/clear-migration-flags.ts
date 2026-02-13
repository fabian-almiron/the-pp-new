/**
 * Script to clear migratedFromWordPress flag for users who have successfully set passwords
 * 
 * This script should be run once to fix users who already reset their password
 * but still have the migration flag, causing them to be prompted on every login.
 * 
 * Run with: npx tsx scripts/clear-migration-flags.ts
 */

import { clerkClient } from '@clerk/nextjs/server';
import 'dotenv/config';

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
      const response = await clerkClient().users.getUserList({
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
            const { migratedFromWordPress, ...restMetadata } = publicMetadata;
            
            await clerkClient().users.updateUserMetadata(user.id, {
              publicMetadata: restMetadata,
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
