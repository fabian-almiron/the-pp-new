import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createClerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Checking subscriptions for user:', userId);

    // Get user from Clerk to get their email
    const clerkUser = await clerkClient.users.getUser(userId);
    const userEmail = clerkUser.emailAddresses[0]?.emailAddress;

    if (!userEmail) {
      return NextResponse.json({ error: 'No email found' }, { status: 400 });
    }

    console.log('📧 User email:', userEmail);

    // Find Stripe customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    if (customers.data.length === 0) {
      return NextResponse.json({ 
        message: 'No Stripe customer found',
        currentRole: clerkUser.publicMetadata?.role || 'customer'
      });
    }

    const customer = customers.data[0];
    console.log('👤 Found Stripe customer:', customer.id);

    // Get all subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 10,
    });

    console.log('📋 Found subscriptions:', subscriptions.data.length);

    // Check if user has any active or trialing subscription
    const activeSubscription = subscriptions.data.find(sub => 
      ['active', 'trialing'].includes(sub.status)
    );

    let newRole = 'customer';
    let subscriptionDetails = null;

    if (activeSubscription) {
      newRole = 'subscriber';
      
      // Safely convert timestamps to ISO strings
      let currentPeriodEndISO = null;
      let trialEndISO = null;
      
      try {
        if (activeSubscription.current_period_end) {
          currentPeriodEndISO = new Date(activeSubscription.current_period_end * 1000).toISOString();
        }
      } catch (e) {
        console.warn('Failed to convert current_period_end to ISO string:', e);
      }
      
      try {
        if (activeSubscription.trial_end) {
          trialEndISO = new Date(activeSubscription.trial_end * 1000).toISOString();
        }
      } catch (e) {
        console.warn('Failed to convert trial_end to ISO string:', e);
      }
      
      subscriptionDetails = {
        id: activeSubscription.id,
        status: activeSubscription.status,
        currentPeriodEnd: currentPeriodEndISO,
        trialEnd: trialEndISO,
      };

      console.log('✅ Active subscription found:', activeSubscription.id, 'Status:', activeSubscription.status);
      
      // Update Clerk metadata
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          role: newRole,
        },
      });

      console.log('✅ Updated Clerk role to:', newRole);
    } else {
      console.log('❌ No active subscription found');
    }

    return NextResponse.json({
      success: true,
      previousRole: clerkUser.publicMetadata?.role || 'customer',
      newRole,
      subscriptionDetails,
      allSubscriptions: subscriptions.data.map(sub => ({
        id: sub.id,
        status: sub.status,
        created: new Date(sub.created * 1000).toISOString(),
      })),
    });

  } catch (error: any) {
    console.error('❌ Error fixing subscription role:', error);
    return NextResponse.json(
      { 
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

