import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }
    
    const { subscriptionId, userId, userEmail } = await request.json();

    if (!subscriptionId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, userId, userEmail' },
        { status: 400 }
      );
    }

    // Fetch subscription details from Strapi (to get Stripe Price ID)
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    const strapiToken = process.env.STRAPI_API_TOKEN;
    
    console.log('🔍 Fetching subscription from Strapi:', subscriptionId);
    
    // Strapi v5 uses documentId
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (strapiToken) {
      headers['Authorization'] = `Bearer ${strapiToken}`;
    }
    
    const subscriptionResponse = await fetch(
      `${strapiUrl}/api/subscriptions?filters[documentId][$eq]=${subscriptionId}&populate=*`,
      { headers }
    );
    
    if (!subscriptionResponse.ok) {
      console.error('❌ Failed to fetch subscription from Strapi:', subscriptionResponse.status);
      return NextResponse.json(
        { error: 'Subscription not found in Strapi' },
        { status: 404 }
      );
    }

    const responseData = await subscriptionResponse.json();
    const subscription = responseData.data?.[0];
    
    if (!subscription) {
      console.error('❌ No subscription data returned from Strapi');
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    console.log('✅ Found subscription:', {
      name: subscription.name,
      price: subscription.subscriptionPrice,
      stripePriceId: subscription.stripePriceId,
      freeTrialDays: subscription.freeTrialDays
    });

    // Validate Stripe Price ID exists
    if (!subscription.stripePriceId) {
      console.error('❌ Subscription missing stripePriceId');
      return NextResponse.json(
        { error: 'Subscription configuration error: missing Stripe Price ID' },
        { status: 500 }
      );
    }

    // Get the origin from the request
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create or retrieve Stripe customer
    let customer;
    try {
      console.log('🔍 Looking for Stripe customer:', userEmail);
      
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
        console.log('✅ Found existing Stripe customer:', customer.id);
        
        // Check if this customer already has an existing subscription
        const existingSubscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 10,
        });

        // Check for truly active subscriptions (active or trialing)
        const activeSubscription = existingSubscriptions.data.find(sub => 
          ['active', 'trialing'].includes(sub.status)
        );

        if (activeSubscription) {
          console.log('❌ Customer already has an active subscription:', activeSubscription.id);
          return NextResponse.json(
            { 
              error: 'You already have an active subscription. Please manage your existing subscription from your account page.',
              subscriptionStatus: activeSubscription.status,
              redirectTo: '/my-account'
            },
            { status: 409 }
          );
        }

        // Check for past_due subscriptions (payment failed)
        const pastDueSubscription = existingSubscriptions.data.find(sub => 
          sub.status === 'past_due'
        );

        if (pastDueSubscription) {
          console.log('⚠️ Customer has past_due subscription:', pastDueSubscription.id);
          return NextResponse.json(
            { 
              error: 'Your subscription payment failed. Please update your payment method to restore access.',
              subscriptionStatus: 'past_due',
              subscriptionId: pastDueSubscription.id,
              redirectTo: '/my-account',
              actionRequired: 'update_payment'
            },
            { status: 409 }
          );
        }

        // Check for incomplete subscriptions
        const incompleteSubscription = existingSubscriptions.data.find(sub => 
          ['incomplete', 'incomplete_expired'].includes(sub.status)
        );

        if (incompleteSubscription) {
          console.log('⚠️ Customer has incomplete subscription:', incompleteSubscription.id);
          return NextResponse.json(
            { 
              error: 'Your previous subscription setup was not completed. Please try again or contact support.',
              subscriptionStatus: incompleteSubscription.status,
              subscriptionId: incompleteSubscription.id,
              redirectTo: '/my-account',
              actionRequired: 'retry_signup'
            },
            { status: 409 }
          );
        }

        // Check for canceled/unpaid subscriptions
        const canceledSubscription = existingSubscriptions.data.find(sub => 
          ['canceled', 'unpaid'].includes(sub.status)
        );

        if (canceledSubscription) {
          console.log('ℹ️ Customer has canceled/unpaid subscription - allowing new signup');
          // Allow them to create a new subscription
        }
        
        // Update metadata if clerkUserId is not set
        if (!customer.metadata?.clerkUserId) {
          await stripe.customers.update(customer.id, {
            metadata: {
              clerkUserId: userId,
            },
          });
          console.log('📝 Updated Stripe customer with Clerk user ID');
        }
      } else {
        console.log('➕ Creating new Stripe customer');
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            clerkUserId: userId,
          },
        });
        console.log('✅ Created Stripe customer:', customer.id);
      }
      
      // Save customer ID to Clerk metadata
      try {
        await clerkClient.users.updateUserMetadata(userId, {
          privateMetadata: {
            stripeCustomerId: customer.id,
          },
        });
        console.log('✅ Saved Stripe customer ID to Clerk metadata');
      } catch (metadataError) {
        console.error('⚠️  Failed to save customer ID to Clerk:', metadataError);
        // Don't fail the checkout if metadata update fails
      }
    } catch (error) {
      console.error('❌ Error creating/retrieving Stripe customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create Checkout Session for subscription
    console.log('🛒 Creating Stripe checkout session...');
    
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: subscription.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/upgrade`,
      subscription_data: {
        metadata: {
          clerkUserId: userId,
          subscriptionName: subscription.name,
        },
        trial_period_days: subscription.freeTrialDays > 0 ? subscription.freeTrialDays : undefined,
      },
      metadata: {
        clerkUserId: userId,
        subscriptionName: subscription.name,
      },
    });

    console.log('✅ Created Stripe checkout session:', session.id);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('❌ Stripe subscription checkout error:', error);
    console.error('❌ Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        error: error.message || 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
