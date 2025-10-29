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

    console.log('🔍 Cancelling subscription for user:', userId);

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
        error: 'No Stripe customer found',
      }, { status: 404 });
    }

    const customer = customers.data[0];
    console.log('👤 Found Stripe customer:', customer.id);

    // Get all active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 10,
    });

    // Also check for trialing subscriptions
    const trialingSubscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'trialing',
      limit: 10,
    });

    const allActiveSubscriptions = [...subscriptions.data, ...trialingSubscriptions.data];

    if (allActiveSubscriptions.length === 0) {
      return NextResponse.json({ 
        error: 'No active subscription found',
      }, { status: 404 });
    }

    // Cancel all active subscriptions (usually there's just one)
    const cancelledSubscriptions = [];
    
    for (const subscription of allActiveSubscriptions) {
      console.log('❌ Cancelling subscription:', subscription.id);
      console.log('   Status:', subscription.status);
      console.log('   Trial end:', subscription.trial_end);
      console.log('   Current period end:', subscription.current_period_end);
      
      // Cancel at period end (user keeps access until end of billing period)
      const cancelledSubscription = await stripe.subscriptions.update(subscription.id, {
        cancel_at_period_end: true,
      });

      // If you want to cancel immediately instead, use:
      // const cancelledSubscription = await stripe.subscriptions.cancel(subscription.id);

      console.log('✅ Subscription cancelled:', subscription.id);
      
      // Determine the end date (trial end or period end)
      let endDate: string;
      if (cancelledSubscription.trial_end) {
        endDate = new Date(cancelledSubscription.trial_end * 1000).toISOString();
      } else if (cancelledSubscription.current_period_end) {
        endDate = new Date(cancelledSubscription.current_period_end * 1000).toISOString();
      } else {
        endDate = 'Unknown';
      }
      
      cancelledSubscriptions.push({
        id: cancelledSubscription.id,
        status: cancelledSubscription.status,
        cancelAtPeriodEnd: cancelledSubscription.cancel_at_period_end,
        accessUntil: endDate,
      });
    }

    // Note: Clerk role will be updated by the webhook when subscription actually ends
    // For cancel_at_period_end, user keeps subscriber role until period ends

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled successfully',
      subscriptions: cancelledSubscriptions,
    });

  } catch (error: any) {
    console.error('❌ Error cancelling subscription:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to cancel subscription',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

