import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
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
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔄 Manual sync name from Stripe for user:', user.id);

    const email = user.emailAddresses?.[0]?.emailAddress;
    
    if (!email) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 });
    }

    console.log('🔍 Looking up Stripe customer for:', email);
    
    // Look up Stripe customer by email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });
    
    if (customers.data.length === 0) {
      return NextResponse.json({ 
        error: 'No Stripe customer found for this email',
        synced: false
      }, { status: 404 });
    }

    const stripeCustomer = customers.data[0];
    console.log('✅ Found Stripe customer:', stripeCustomer.id);
    
    if (!stripeCustomer.name) {
      return NextResponse.json({ 
        error: 'Stripe customer has no name set',
        synced: false
      }, { status: 400 });
    }

    // Parse name from Stripe
    const nameParts = stripeCustomer.name.trim().split(' ');
    const stripeFirstName = nameParts[0] || '';
    const stripeLastName = nameParts.slice(1).join(' ') || '';
    
    console.log('🔄 Updating Clerk name:', stripeFirstName, stripeLastName);
    
    // Update Clerk user
    await clerkClient.users.updateUser(user.id, {
      firstName: stripeFirstName,
      lastName: stripeLastName,
    });
    
    console.log('✅ Successfully updated Clerk user name');
    
    // Also save Stripe customer ID if not already saved
    if (!user.privateMetadata?.stripeCustomerId) {
      await clerkClient.users.updateUserMetadata(user.id, {
        privateMetadata: {
          stripeCustomerId: stripeCustomer.id,
        },
      });
      console.log('✅ Saved Stripe customer ID to Clerk metadata');
    }
    
    return NextResponse.json({ 
      synced: true,
      firstName: stripeFirstName,
      lastName: stripeLastName,
      stripeCustomerId: stripeCustomer.id
    });

  } catch (error: any) {
    console.error('❌ Error syncing name from Stripe:', error);
    return NextResponse.json(
      { 
        error: error.message || 'Failed to sync name from Stripe',
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

