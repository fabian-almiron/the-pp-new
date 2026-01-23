import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not configured');
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }
    
    const { subscriptionId, firstName, lastName, email, password } = await request.json();

    if (!subscriptionId || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, firstName, lastName, email, password' },
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

    // Create Checkout Session WITHOUT creating a customer first
    // Stripe will automatically create the customer when payment succeeds
    console.log('🛒 Creating Stripe checkout session (no customer/account created yet)...');
    
    const session = await stripe.checkout.sessions.create({
      // Don't specify customer - let Stripe create it when payment succeeds
      customer_creation: 'always', // Stripe creates customer only when payment is submitted
      customer_email: email.toLowerCase().trim(), // Pre-fill email in checkout form
      payment_method_types: ['card'],
      line_items: [
        {
          price: subscription.stripePriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/signup?cancelled=true`,
      subscription_data: {
        metadata: {
          pendingSignup: 'true',
          subscriptionName: subscription.name,
        },
        trial_period_days: subscription.freeTrialDays > 0 ? subscription.freeTrialDays : undefined,
      },
      metadata: {
        pendingSignup: 'true',
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.toLowerCase().trim(),
        password: password, // Store password to create Clerk account after payment
        subscriptionName: subscription.name,
      },
    });

    console.log('✅ Created Stripe checkout session:', session.id);

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('❌ Stripe guest checkout error:', error);
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
