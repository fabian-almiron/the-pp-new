/**
 * Fix customers with invalid "guest" role
 * This should be "customer" or "subscriber" based on their Stripe subscription status
 * 
 * Run with: npx tsx scripts/fix-guest-role.ts
 */

// Load environment variables
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

if (!process.env.CLERK_SECRET_KEY) {
  console.error('❌ CLERK_SECRET_KEY not found');
  process.exit(1);
}

if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY not found');
  process.exit(1);
}

import { createClerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

async function fixGuestRoles() {
  console.log('🔍 Looking for users with invalid "guest" role...\n');
  
  try {
    // Get all users from Clerk
    const users = await clerkClient.users.getUserList({
      limit: 500,
    });
    
    console.log(`📊 Checking ${users.data.length} users...\n`);
    
    let fixedCount = 0;
    
    for (const user of users.data) {
      const currentRole = user.publicMetadata?.role as string | undefined;
      
      // Skip if role is valid
      if (!currentRole || currentRole === 'guest') {
        const email = user.emailAddresses[0]?.emailAddress;
        
        console.log(`❌ Found user with invalid role: "${currentRole || '(none)'}"`);
        console.log(`   Email: ${email}`);
        console.log(`   User ID: ${user.id}`);
        
        // Check if they have a Stripe customer and active subscription
        let correctRole = 'customer';
        
        if (email) {
          try {
            const customers = await stripe.customers.list({
              email: email,
              limit: 1,
            });
            
            if (customers.data.length > 0) {
              const customer = customers.data[0];
              console.log(`   Stripe Customer: ${customer.id}`);
              
              // Check for active subscriptions
              const subscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                limit: 10,
              });
              
              const activeSubscription = subscriptions.data.find(sub =>
                ['active', 'trialing'].includes(sub.status)
              );
              
              if (activeSubscription) {
                console.log(`   ✅ Has active subscription: ${activeSubscription.id}`);
                correctRole = 'subscriber';
              } else if (subscriptions.data.length > 0) {
                console.log(`   ⚠️  Has subscription but not active (status: ${subscriptions.data[0].status})`);
                correctRole = 'customer';
              } else {
                console.log(`   ℹ️  No subscriptions found`);
                correctRole = 'customer';
              }
            } else {
              console.log(`   ℹ️  No Stripe customer found`);
              correctRole = 'customer';
            }
          } catch (stripeError) {
            console.error(`   ⚠️  Error checking Stripe:`, stripeError);
            correctRole = 'customer';
          }
        }
        
        console.log(`   🔧 Fixing: Setting role to "${correctRole}"`);
        
        // Update the role in Clerk
        try {
          await clerkClient.users.updateUserMetadata(user.id, {
            publicMetadata: {
              role: correctRole,
            },
          });
          
          console.log(`   ✅ Successfully updated to "${correctRole}"\n`);
          fixedCount++;
        } catch (updateError: any) {
          console.error(`   ❌ Failed to update role:`, updateError.message, '\n');
        }
      }
    }
    
    console.log(`\n${'─'.repeat(60)}`);
    console.log(`✅ Fixed ${fixedCount} users with invalid roles`);
    
    if (fixedCount === 0) {
      console.log('All users have valid roles!');
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the fix
fixGuestRoles().then(() => {
  console.log('\n✅ Done!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
