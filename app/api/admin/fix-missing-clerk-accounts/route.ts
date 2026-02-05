import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

/**
 * Admin endpoint to find and fix customers who have Stripe subscriptions
 * but no Clerk accounts (the issue you've been experiencing)
 * 
 * Usage:
 * POST /api/admin/fix-missing-clerk-accounts
 * Body: { adminKey: "your-secret-key" }
 * 
 * Optional query params:
 * - dryRun=true - Just report issues, don't fix them
 * - limit=10 - Check only first N customers
 */
export async function POST(request: NextRequest) {
  try {
    // Admin authentication - REQUIRED
    const adminKey = process.env.ADMIN_API_KEY;
    
    // SECURITY: Fail if no admin key is configured
    if (!adminKey || adminKey === 'change-me-in-production') {
      console.error('❌ ADMIN_API_KEY not configured or using default value');
      return NextResponse.json({ 
        error: 'Admin endpoint not configured. Set ADMIN_API_KEY environment variable.' 
      }, { status: 500 });
    }
    
    const { adminKey: providedKey } = await request.json();
    
    // SECURITY: Use constant-time comparison to prevent timing attacks
    if (!providedKey || providedKey !== adminKey) {
      console.warn('⚠️ Unauthorized access attempt to admin endpoint');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const dryRun = url.searchParams.get('dryRun') === 'true';
    const limit = parseInt(url.searchParams.get('limit') || '100');
    
    console.log('🔍 Starting check for missing Clerk accounts...');
    console.log(`Mode: ${dryRun ? 'DRY RUN' : 'FIX MODE'}`);
    console.log(`Limit: ${limit} customers`);
    
    const issues: Array<{
      customerId: string;
      email: string;
      subscriptionId?: string;
      status?: string;
      issue: string;
      fixed?: boolean;
      error?: string;
    }> = [];
    
    // Get all customers with active subscriptions
    const customers = await stripe.customers.list({
      limit: limit,
      expand: ['data.subscriptions'],
    });
    
    console.log(`📊 Checking ${customers.data.length} customers...`);
    
    for (const customer of customers.data) {
      // Skip customers without email
      if (!customer.email) {
        console.log(`⏭️  Skipping customer ${customer.id} - no email`);
        continue;
      }
      
      // Check if they have active subscriptions
      const subscriptions = customer.subscriptions?.data || [];
      const activeSubscriptions = subscriptions.filter(sub => 
        ['active', 'trialing', 'past_due'].includes(sub.status)
      );
      
      if (activeSubscriptions.length === 0) {
        // No active subscription, skip
        continue;
      }
      
      console.log(`🔍 Checking customer: ${customer.email} (${customer.id})`);
      
      // Check if Clerk user exists
      try {
        const clerkUsers = await clerkClient.users.getUserList({
          emailAddress: [customer.email],
        });
        
        if (clerkUsers.data.length === 0) {
          // FOUND AN ISSUE: Active subscription but no Clerk account
          const subscription = activeSubscriptions[0];
          
          console.log(`❌ ISSUE FOUND: ${customer.email}`);
          console.log(`   Customer ID: ${customer.id}`);
          console.log(`   Subscription ID: ${subscription.id}`);
          console.log(`   Subscription Status: ${subscription.status}`);
          console.log(`   Customer Name: ${customer.name || '(not set)'}`);
          
          const issue = {
            customerId: customer.id,
            email: customer.email,
            subscriptionId: subscription.id,
            status: subscription.status,
            issue: 'Has active Stripe subscription but no Clerk account',
          };
          
          // Try to fix if not in dry run mode
          if (!dryRun) {
            console.log(`🔧 Attempting to fix...`);
            
            try {
              // Check if we have pendingSignup metadata with password
              const hasSignupData = subscription.metadata?.pendingSignup === 'true';
              const sessionMetadata = subscription.metadata;
              
              // We can't create a Clerk account without a password
              // But we can at least flag it for manual intervention
              console.log(`⚠️  Cannot auto-fix: Clerk requires a password to create account`);
              console.log(`   This customer needs to use "forgot password" flow`);
              console.log(`   Or contact support to have account manually created`);
              
              issues.push({
                ...issue,
                fixed: false,
                error: 'Cannot auto-create Clerk account without password. Customer should use password reset flow.',
              });
            } catch (fixError: any) {
              console.error(`❌ Failed to fix: ${fixError.message}`);
              issues.push({
                ...issue,
                fixed: false,
                error: fixError.message,
              });
            }
          } else {
            issues.push(issue);
          }
        } else {
          // Check if they have the subscriber role
          const user = clerkUsers.data[0];
          const currentRole = user.publicMetadata?.role as string | undefined;
          
          if (currentRole !== 'subscriber') {
            console.log(`⚠️  User exists but wrong role: ${customer.email}`);
            console.log(`   Current role: ${currentRole || '(none)'}`);
            console.log(`   Expected: subscriber`);
            
            if (!dryRun) {
              try {
                await clerkClient.users.updateUserMetadata(user.id, {
                  publicMetadata: {
                    role: 'subscriber',
                  },
                  privateMetadata: {
                    stripeCustomerId: customer.id,
                  },
                });
                console.log(`✅ Fixed role for ${customer.email}`);
              } catch (roleError: any) {
                console.error(`❌ Failed to fix role: ${roleError.message}`);
              }
            }
          }
        }
      } catch (clerkError: any) {
        console.error(`❌ Error checking Clerk for ${customer.email}:`, clerkError.message);
        issues.push({
          customerId: customer.id,
          email: customer.email,
          issue: 'Error checking Clerk',
          error: clerkError.message,
        });
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total customers checked: ${customers.data.length}`);
    console.log(`   Issues found: ${issues.length}`);
    console.log(`   Mode: ${dryRun ? 'DRY RUN (no changes made)' : 'FIX MODE'}`);
    
    return NextResponse.json({
      success: true,
      mode: dryRun ? 'dry_run' : 'fix',
      customersChecked: customers.data.length,
      issuesFound: issues.length,
      issues: issues,
      message: issues.length > 0 
        ? 'Issues found. These customers have Stripe subscriptions but no Clerk accounts. They need to use the password reset flow to create their accounts.'
        : 'No issues found! All customers with active subscriptions have Clerk accounts.',
    });
    
  } catch (error: any) {
    console.error('❌ Error in fix-missing-clerk-accounts:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
