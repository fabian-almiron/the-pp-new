import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, userId, userEmail } = await request.json();

    if (!subscriptionId || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields: subscriptionId, userId, userEmail' },
        { status: 400 }
      );
    }

    // Fetch subscription details from Strapi
    const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
    
    // Strapi v5 uses documentId, so we need to fetch by documentId
    const subscriptionResponse = await fetch(`${strapiUrl}/api/subscriptions?filters[documentId][$eq]=${subscriptionId}&populate=*`);
    
    if (!subscriptionResponse.ok) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    const responseData = await subscriptionResponse.json();
    const subscription = responseData.data?.[0];
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Get the origin from the request
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Get Strapi user by Clerk ID
    const strapiToken = process.env.STRAPI_API_TOKEN;
    const strapiUserResponse = await fetch(`${strapiUrl}/api/users?filters[clerkId][$eq]=${userId}`, {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
      },
    });

    let strapiUserId;
    if (strapiUserResponse.ok) {
      const strapiUsers = await strapiUserResponse.json();
      if (strapiUsers.length > 0) {
        strapiUserId = strapiUsers[0].id;
      }
    }

    if (!strapiUserId) {
      return NextResponse.json(
        { error: 'User not found in Strapi. Please contact support.' },
        { status: 404 }
      );
    }

    // Create or retrieve Stripe customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });
      
      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            strapiUserId: userId.toString(),
          },
        });
      }
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create Checkout Session for subscription
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
      success_url: `${origin}/video-library`,
      cancel_url: `${origin}/signup`,
      subscription_data: {
        metadata: {
          clerkUserId: userId.toString(),
          strapiUserId: strapiUserId.toString(),
          strapiSubscriptionId: subscriptionId.toString(),
        },
        trial_period_days: subscription.freeTrialDays > 0 ? subscription.freeTrialDays : undefined,
      },
      metadata: {
        clerkUserId: userId.toString(),
        strapiUserId: strapiUserId.toString(),
        strapiSubscriptionId: subscriptionId.toString(),
      },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error('Stripe subscription checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
