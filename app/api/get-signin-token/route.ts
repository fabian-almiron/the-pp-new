import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session ID' },
        { status: 400 }
      );
    }

    console.log('🔍 Fetching checkout session:', sessionId);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.subscription) {
      return NextResponse.json(
        { error: 'No subscription found for this session' },
        { status: 404 }
      );
    }

    console.log('🔍 Fetching subscription:', session.subscription);

    // Retrieve the subscription to get the sign-in token from metadata
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

    const signInToken = subscription.metadata?.signInToken;

    if (!signInToken) {
      return NextResponse.json(
        { error: 'No sign-in token found. Account may still be processing.' },
        { status: 404 }
      );
    }

    console.log('✅ Found sign-in token');

    return NextResponse.json({ signInToken });
  } catch (error: any) {
    console.error('❌ Error retrieving sign-in token:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to retrieve sign-in token' },
      { status: 500 }
    );
  }
}
