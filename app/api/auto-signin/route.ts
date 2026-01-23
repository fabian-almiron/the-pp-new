import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClerkClient } from '@clerk/nextjs/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const clerkClient = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY!,
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

    console.log('🔍 Fetching checkout session for auto-signin:', sessionId);

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.subscription) {
      return NextResponse.json(
        { error: 'No subscription found for this session' },
        { status: 404 }
      );
    }

    // Get the email from session metadata (stored during checkout)
    const email = session.metadata?.email || session.customer_email || session.customer_details?.email;

    if (!email) {
      return NextResponse.json(
        { error: 'No email found in session' },
        { status: 404 }
      );
    }

    console.log('📧 Looking up Clerk user by email:', email);

    // Look up the Clerk user by email
    try {
      const users = await clerkClient.users.getUserList({
        emailAddress: [email],
        limit: 1,
      });

      if (!users.data || users.data.length === 0) {
        // Account not created yet by webhook
        return NextResponse.json(
          { error: 'Account not ready yet. Please wait a moment.' },
          { status: 404 }
        );
      }

      const user = users.data[0];
      console.log('✅ Found Clerk user:', user.id);

      // Create a sign-in token for this user
      console.log('🎫 Creating sign-in token...');
      const signInToken = await clerkClient.signInTokens.createSignInToken({
        userId: user.id,
        expiresInSeconds: 600, // 10 minutes
      });

      console.log('✅ Created sign-in token');

      return NextResponse.json({ 
        token: signInToken.token,
        userId: user.id 
      });

    } catch (clerkError: any) {
      console.error('❌ Error looking up Clerk user:', clerkError);
      return NextResponse.json(
        { error: 'Account not found or not ready yet' },
        { status: 404 }
      );
    }

  } catch (error: any) {
    console.error('❌ Error in auto-signin:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create sign-in token' },
      { status: 500 }
    );
  }
}
