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

    console.log('🔗 Link Stripe Customer request for user:', user.id);

    // Check if already linked
    if (user.privateMetadata?.stripeCustomerId) {
      console.log('✅ Already linked to Stripe customer:', user.privateMetadata.stripeCustomerId);
      return NextResponse.json({ 
        customerId: user.privateMetadata.stripeCustomerId,
        alreadyLinked: true 
      });
    }

    const userEmail = user.emailAddresses[0]?.emailAddress;
    
    if (!userEmail) {
      return NextResponse.json({ error: 'No email address found' }, { status: 400 });
    }

    console.log('🔍 Looking for Stripe customer with email:', userEmail);
    
    // Look up Stripe customer by email
    const customers = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });
    
    let customerId: string;
    let wasCreated = false;
    
    if (customers.data.length > 0) {
      // Found existing customer
      customerId = customers.data[0].id;
      console.log('✅ Found existing Stripe customer:', customerId);
      
      // Update customer metadata to include Clerk user ID if not already set
      if (!customers.data[0].metadata?.clerkUserId) {
        await stripe.customers.update(customerId, {
          metadata: {
            clerkUserId: user.id,
          },
        });
        console.log('📝 Updated Stripe customer with Clerk user ID');
      }
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: userEmail,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        metadata: {
          clerkUserId: user.id,
        },
      });
      customerId = customer.id;
      wasCreated = true;
      console.log('✅ Created new Stripe customer:', customerId);
    }
    
    // Store in Clerk metadata
    await clerkClient.users.updateUserMetadata(user.id, {
      privateMetadata: {
        stripeCustomerId: customerId,
      },
    });
    
    console.log('✅ Saved Stripe customer ID to Clerk metadata');
    
    return NextResponse.json({ 
      customerId,
      linked: true,
      wasCreated 
    });
  } catch (error: any) {
    console.error('❌ Error linking Stripe customer:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to link Stripe customer' },
      { status: 500 }
    );
  }
}

