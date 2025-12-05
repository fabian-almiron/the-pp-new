import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

/**
 * Debug endpoint to check what Stripe returns for a user's purchases
 * This helps identify why purchase verification might be failing
 */
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    const { createClerkClient } = await import('@clerk/nextjs/server');
    const clerkClient = createClerkClient({
      secretKey: process.env.CLERK_SECRET_KEY!,
    });
    
    const clerkUser = await clerkClient.users.getUser(user.id);
    const stripeCustomerId = clerkUser.privateMetadata?.stripeCustomerId as string | undefined;

    let userSessions: Stripe.Checkout.Session[];

    if (stripeCustomerId) {
      const sessions = await stripe.checkout.sessions.list({
        customer: stripeCustomerId,
        limit: 100,
      });
      userSessions = sessions.data.filter(session => 
        session.mode === 'payment' && session.payment_status === 'paid'
      );
    } else if (userEmail) {
      const sessions = await stripe.checkout.sessions.list({
        limit: 100,
      });
      userSessions = sessions.data.filter(session => 
        session.customer_email === userEmail &&
        session.mode === 'payment' &&
        session.payment_status === 'paid'
      );
    } else {
      return NextResponse.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    // Get detailed info for debugging
    const debugInfo = await Promise.all(
      userSessions.map(async (session) => {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.price.product'],
        });

        return {
          sessionId: session.id,
          date: new Date(session.created * 1000).toISOString(),
          total: session.amount_total ? session.amount_total / 100 : 0,
          items: lineItems.data.map(item => {
            const product = item.price?.product as Stripe.Product | undefined;
            return {
              description: item.description,
              productName: product?.name,
              productId: product?.id,
              productMetadata: product?.metadata,
              productSlug: product?.metadata?.slug,
            };
          }),
        };
      })
    );

    return NextResponse.json({
      userId: user.id,
      email: userEmail,
      stripeCustomerId,
      sessionsFound: userSessions.length,
      sessions: debugInfo,
    });
  } catch (error: any) {
    console.error('❌ Debug error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to debug purchases' },
      { status: 500 }
    );
  }
}

