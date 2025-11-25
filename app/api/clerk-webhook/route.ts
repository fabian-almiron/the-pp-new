import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/nextjs/server';

// Webhook secret from Clerk Dashboard
const webhookSecret = process.env.CLERK_WEBHOOK_SECRET || '';

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

  return NextResponse.json({ received: true });
}

