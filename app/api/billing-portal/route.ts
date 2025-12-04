import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('💳 Billing portal request for user:', user.id);

    // Get Stripe customer ID from Clerk metadata
    let stripeCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;
    
    // If not in metadata, try to find by email
    if (!stripeCustomerId) {
      const userEmail = user.emailAddresses[0]?.emailAddress;
      
      if (!userEmail) {
        return NextResponse.json({ error: 'No email address found' }, { status: 400 });
      }

      console.log('🔍 Looking for Stripe customer by email:', userEmail);
      
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length === 0) {
        return NextResponse.json({ 
          error: 'No billing information found. Please make a purchase first.' 
        }, { status: 404 });
      }

      stripeCustomerId = customers.data[0].id;
      console.log('✅ Found Stripe customer:', stripeCustomerId);
    }

    // Get the origin for return URL
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = `${origin}/my-account`;

    console.log('🔗 Creating billing portal session...');
    console.log('   Customer:', stripeCustomerId);
    console.log('   Return URL:', returnUrl);

    // Create Stripe billing portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: returnUrl,
    });

    console.log('✅ Billing portal session created:', session.id);

    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id
    });

  } catch (error: any) {
    console.error('❌ Error creating billing portal session:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to create billing portal session',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

