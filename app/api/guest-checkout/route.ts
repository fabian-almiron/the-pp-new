import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';
import { encrypt } from '@/lib/crypto';

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
    
    const { subscriptionId, firstName, lastName, email, password } = await request.json();

    if (!subscriptionId || !firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, firstName, lastName, email, password' },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email is already registered in Clerk
    console.log('🔍 Checking if email is already registered:', normalizedEmail);
    try {
      const existingUsers = await clerkClient.users.getUserList({
        emailAddress: [normalizedEmail],
      });

      if (existingUsers.data.length > 0) {
        console.log('❌ Email already registered:', normalizedEmail);
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 } // 409 Conflict
        );
      }
      console.log('✅ Email is available');
    } catch (clerkError) {
      console.error('⚠️  Error checking Clerk users:', clerkError);
      // Continue anyway - we'll catch duplicates later
    }

    // Check if email already has a Stripe customer with an active subscription
    console.log('🔍 Checking for existing Stripe subscriptions:', normalizedEmail);
    try {
      const existingCustomers = await stripe.customers.list({
        email: normalizedEmail,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        const customer = existingCustomers.data[0];
        console.log('🔍 Found existing Stripe customer:', customer.id);

        // Check if this customer has any active subscriptions
        const subscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 10,
        });

        const activeSubscription = subscriptions.data.find(sub => 
          ['active', 'trialing', 'past_due'].includes(sub.status)
        );

        if (activeSubscription) {
          console.log('❌ Email already has an active subscription:', normalizedEmail);
          return NextResponse.json(
            { error: 'This email is already associated with an active subscription. Please sign in to manage your account.' },
            { status: 409 }
          );
        }
        console.log('✅ No active subscriptions found');
      }
    } catch (stripeError) {
      console.error('⚠️  Error checking Stripe customers:', stripeError);
      // Continue anyway
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
    // For subscription mode, Stripe automatically creates customer when payment is submitted
    // (customer_creation parameter is only for payment mode, not subscription mode)
    console.log('🛒 Creating Stripe checkout session (no customer/account created yet)...');
    
    // 🔒 SECURITY: Encrypt password before storing in Stripe metadata
    // This prevents plain-text passwords from being visible in Stripe dashboard
    console.log('🔒 Encrypting password for secure storage...');
    const encryptedPassword = encrypt(password);
    
    const session = await stripe.checkout.sessions.create({
      // Don't specify customer - Stripe auto-creates it when payment succeeds in subscription mode
      customer_email: normalizedEmail, // Pre-fill email in checkout form
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
        email: normalizedEmail,
        password: encryptedPassword, // 🔒 Encrypted password (secure storage)
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
