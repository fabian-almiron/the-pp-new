/**
 * Health Check Script for Subscription/Clerk Sync
 * 
 * This script checks for customers who have active Stripe subscriptions
 * but are missing Clerk accounts (the issue you've been experiencing)
 * 
 * Run with: npx tsx scripts/check-subscription-health.ts
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

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

async function checkHealth() {
  console.log('🏥 Starting subscription health check...\n');
  
  try {
    // Get customers with active subscriptions
    const customers = await stripe.customers.list({
      limit: 100,
      expand: ['data.subscriptions'],
    });
    
    console.log(`📊 Found ${customers.data.length} customers\n`);
    
    let issuesFound = 0;
    const issues: any[] = [];
    
    for (const customer of customers.data) {
      if (!customer.email) continue;
      
      const subscriptions = customer.subscriptions?.data || [];
      const activeSubscriptions = subscriptions.filter(sub => 
        ['active', 'trialing', 'past_due'].includes(sub.status)
      );
      
      if (activeSubscriptions.length === 0) continue;
      
      // Check if they have clerkUserId in metadata
      const hasClerkId = customer.metadata?.clerkUserId;
      const subscription = activeSubscriptions[0];
      const subHasClerkId = subscription.metadata?.clerkUserId;
      
      if (!hasClerkId && !subHasClerkId) {
        issuesFound++;
        const issue = {
          customerId: customer.id,
          customerName: customer.name || '(no name)',
          email: customer.email,
          subscriptionId: subscription.id,
          subscriptionStatus: subscription.status,
          created: new Date(customer.created * 1000).toLocaleDateString(),
        };
        
        issues.push(issue);
        
        console.log(`❌ Issue #${issuesFound}`);
        console.log(`   Email: ${issue.email}`);
        console.log(`   Name: ${issue.customerName}`);
        console.log(`   Customer ID: ${issue.customerId}`);
        console.log(`   Subscription: ${issue.subscriptionId} (${issue.subscriptionStatus})`);
        console.log(`   Created: ${issue.created}`);
        console.log('   Problem: Has active subscription but no Clerk user ID linked\n');
      }
    }
    
    if (issuesFound === 0) {
      console.log('✅ All good! No issues found.');
      console.log('All customers with active subscriptions have Clerk accounts linked.\n');
    } else {
      console.log(`\n⚠️  Found ${issuesFound} potential issues`);
      console.log('\nThese customers may need manual intervention:');
      console.log('1. Check if they can log in to their Clerk account');
      console.log('2. If not, they need to use password reset to create account');
      console.log('3. Or manually create their account in Clerk dashboard\n');
      
      console.log('Issue Summary:');
      console.table(issues.map(i => ({
        Email: i.email,
        Name: i.customerName,
        Status: i.subscriptionStatus,
        Created: i.created,
      })));
    }
    
    return {
      success: true,
      customersChecked: customers.data.length,
      issuesFound,
      issues,
    };
  } catch (error: any) {
    console.error('❌ Error running health check:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Run if called directly
if (require.main === module) {
  checkHealth().then(() => {
    process.exit(0);
  }).catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

export default checkHealth;
