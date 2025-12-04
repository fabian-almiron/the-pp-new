import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/nextjs/server';
import Stripe from 'stripe';

// Webhook secret from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    console.error('❌ CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  // Get the webhook headers
  const svix_id = request.headers.get('svix-id');
  const svix_timestamp = request.headers.get('svix-timestamp');
  const svix_signature = request.headers.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return NextResponse.json(
      { error: 'Missing svix headers' },
      { status: 400 }
    );
  }

  // Get the body
  const payload = await request.text();

  // Create a new Webhook instance
  const wh = new Webhook(webhookSecret);

  let evt: any;

  try {
    evt = wh.verify(payload, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    });
  } catch (err) {
    console.error('❌ Error verifying webhook:', err);
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 400 }
    );
  }

  // Handle the webhook event
  const eventType = evt.type;
  console.log(`📨 Clerk webhook received: ${eventType}`);

  // When a new user is created, set their default role to "customer"
  if (eventType === 'user.created') {
    const userId = evt.data.id;
    const email = evt.data.email_addresses?.[0]?.email_address;
    
    console.log(`👤 New user created: ${userId} (${email})`);

    try {
      // Check if the user already has a role (in case it was set during signup)
      const user = await clerkClient().users.getUser(userId);
      
      if (!user.publicMetadata?.role) {
        // Set default role to "customer"
        await clerkClient().users.updateUserMetadata(userId, {
          publicMetadata: {
            role: 'customer',
          },
        });
        console.log(`✅ Set default role "customer" for user: ${userId}`);
      } else {
        console.log(`ℹ️ User ${userId} already has role: ${user.publicMetadata.role}`);
      }
    } catch (error) {
      console.error(`❌ Error setting default role for user ${userId}:`, error);
      // Don't fail the webhook if we can't set the role
    }
  }

  // When a user session is created (sign in), sync name from Stripe if available
  if (eventType === 'session.created') {
    const userId = evt.data.user_id;
    
    console.log(`🔐 User session created: ${userId}`);

    try {
      const user = await clerkClient().users.getUser(userId);
      const email = user.emailAddresses?.[0]?.emailAddress;
      
      if (email) {
        console.log(`🔍 Looking up Stripe customer for: ${email}`);
        
        // Look up Stripe customer by email
        const customers = await stripe.customers.list({
          email: email,
          limit: 1,
        });
        
        if (customers.data.length > 0) {
          const stripeCustomer = customers.data[0];
          console.log(`✅ Found Stripe customer: ${stripeCustomer.id}`);
          
          // Always update Clerk name from Stripe (overwrite existing)
          if (stripeCustomer.name) {
            const nameParts = stripeCustomer.name.trim().split(' ');
            const stripeFirstName = nameParts[0] || '';
            const stripeLastName = nameParts.slice(1).join(' ') || '';
            
            console.log(`🔄 Updating Clerk name from Stripe: ${stripeCustomer.name}`);
            console.log(`   Old name: ${user.firstName || '(none)'} ${user.lastName || '(none)'}`);
            console.log(`   New name: ${stripeFirstName} ${stripeLastName}`);
            
            await clerkClient().users.updateUser(userId, {
              firstName: stripeFirstName,
              lastName: stripeLastName,
            });
            
            console.log(`✅ Updated Clerk user name to: ${stripeFirstName} ${stripeLastName}`);
          } else {
            console.log(`ℹ️ Stripe customer has no name set`);
          }
          
          // Also save Stripe customer ID to Clerk metadata if not already saved
          if (!user.privateMetadata?.stripeCustomerId) {
            await clerkClient().users.updateUserMetadata(userId, {
              privateMetadata: {
                stripeCustomerId: stripeCustomer.id,
              },
            });
            console.log(`✅ Saved Stripe customer ID to Clerk metadata`);
          }
        } else {
          console.log(`ℹ️ No Stripe customer found for email: ${email}`);
        }
      }
    } catch (error) {
      console.error(`❌ Error syncing name from Stripe:`, error);
      // Don't fail the webhook if we can't sync the name
    }
  }

  return NextResponse.json({ received: true });
}

