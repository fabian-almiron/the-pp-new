import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { clerkClient } from '@clerk/nextjs/server';

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!;
const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
const strapiToken = process.env.STRAPI_API_TOKEN;

export async function POST(request: NextRequest) {
  console.log('🔔 Clerk webhook received');
  
  // Check if webhook secret is configured
  if (!webhookSecret) {
    console.error('❌ CLERK_WEBHOOK_SECRET not configured');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify the webhook signature
  const payload = await request.text();
  const headers = {
    'svix-id': request.headers.get('svix-id')!,
    'svix-timestamp': request.headers.get('svix-timestamp')!,
    'svix-signature': request.headers.get('svix-signature')!,
  };

  console.log('🔍 Verifying webhook signature...');
  
  const wh = new Webhook(webhookSecret);
  let evt: any;

  try {
    evt = wh.verify(payload, headers);
    console.log('✅ Webhook signature verified');
  } catch (err) {
    console.error('❌ Clerk webhook verification failed:', err);
    return NextResponse.json({ error: 'Webhook verification failed' }, { status: 400 });
  }

  const eventType = evt.type;
  const { id, email_addresses, first_name, last_name, username, public_metadata, password_enabled } = evt.data;

  console.log(`📨 Event type: ${eventType}`);
  
  try {
    switch (eventType) {
      case 'user.created':
        console.log('👤 Creating user in Strapi...');
        await handleUserCreated(id, email_addresses, first_name, last_name, username);
        break;
      
      case 'user.updated':
        console.log('🔄 Updating user in Strapi...');
        await handleUserUpdated(id, email_addresses, first_name, last_name, username);
        
        // Check if password was changed for migrated WordPress users
        if (public_metadata?.migratedFromWordPress && password_enabled) {
          console.log('🔐 Password reset detected for migrated user, removing migration flag...');
          await handlePasswordReset(id);
        }
        break;
      
      case 'user.deleted':
        console.log('🗑️ Deleting user in Strapi...');
        await handleUserDeleted(id);
        break;
      
      default:
        console.log(`⚠️ Unhandled Clerk event type: ${eventType}`);
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Clerk webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleUserCreated(
  clerkId: string,
  emailAddresses: any[],
  firstName: string,
  lastName: string,
  username: string
) {
  console.log('📧 Processing user creation for:', clerkId);
  
  const email = emailAddresses[0]?.email_address;
  
  if (!email) {
    console.error('❌ No email found for Clerk user:', clerkId);
    return;
  }

  console.log('📧 Email:', email);

  // Check if Strapi token is configured
  if (!strapiToken) {
    console.error('❌ STRAPI_API_TOKEN not configured');
    throw new Error('STRAPI_API_TOKEN not configured');
  }

  // Get the default "Customer" role
  console.log('🔍 Fetching roles from Strapi...');
  const rolesResponse = await fetch(`${strapiUrl}/api/users-permissions/roles`, {
    headers: {
      'Authorization': `Bearer ${strapiToken}`,
    },
  });

  if (!rolesResponse.ok) {
    console.error('❌ Failed to fetch roles from Strapi:', rolesResponse.status);
    throw new Error('Failed to fetch roles from Strapi');
  }

  const { roles } = await rolesResponse.json();
  console.log('📋 Available roles:', roles.map((r: any) => ({ name: r.name, type: r.type, id: r.id })));
  
  // Try to find Customer role, or fall back to first available role
  let customerRole = roles.find((r: any) => r.name === 'Customer');
  
  // If no Customer role, try 'Authenticated' or first available role
  if (!customerRole && roles.length > 0) {
    customerRole = roles.find((r: any) => r.name === 'Authenticated') || 
                  roles.find((r: any) => r.type === 'authenticated') || 
                  roles[0];
    console.log('✅ Using fallback role for new user:', customerRole.name);
  }
  
  if (!customerRole) {
    console.error('❌ No roles found in Strapi');
    throw new Error('No roles found in Strapi');
  }

  console.log('✅ Found Customer role:', customerRole.id);

  // Create user in Strapi
  try {
    const response = await fetch(`${strapiUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username || email.split('@')[0],
        email: email,
        password: Math.random().toString(36).substring(2, 15), // Random password since auth is handled by Clerk
        clerkId: clerkId, // Store Clerk ID for reference
        firstName: firstName,
        lastName: lastName,
        confirmed: true, // Email is already confirmed by Clerk
        blocked: false,
        role: customerRole.id,
      }),
    });

    if (response.ok) {
      const user = await response.json();
      console.log('✅ Created Strapi user:', user.id, 'for Clerk user:', clerkId);
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to create Strapi user:', response.status, errorText);
      throw new Error(`Failed to create Strapi user: ${errorText}`);
    }
  } catch (error) {
    console.error('❌ Error creating Strapi user:', error);
    throw error;
  }
}

async function handleUserUpdated(
  clerkId: string,
  emailAddresses: any[],
  firstName: string,
  lastName: string,
  username: string
) {
  const email = emailAddresses[0]?.email_address;

  // Find user by Clerk ID
  const usersResponse = await fetch(
    `${strapiUrl}/api/users?filters[clerkId][$eq]=${clerkId}`,
    {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
      },
    }
  );

  if (!usersResponse.ok) return;

  const users = await usersResponse.json();
  
  if (users.length === 0) {
    console.log('User not found in Strapi, creating...');
    await handleUserCreated(clerkId, emailAddresses, firstName, lastName, username);
    return;
  }

  const strapiUser = users[0];

  // Update user in Strapi
  await fetch(`${strapiUrl}/api/users/${strapiUser.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${strapiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: email,
      username: username || email.split('@')[0],
      firstName: firstName,
      lastName: lastName,
    }),
  });

  console.log('✅ Updated Strapi user:', strapiUser.id);
}

async function handleUserDeleted(clerkId: string) {
  // Find user by Clerk ID
  const usersResponse = await fetch(
    `${strapiUrl}/api/users?filters[clerkId][$eq]=${clerkId}`,
    {
      headers: {
        'Authorization': `Bearer ${strapiToken}`,
      },
    }
  );

  if (!usersResponse.ok) return;

  const users = await usersResponse.json();
  
  if (users.length === 0) return;

  const strapiUser = users[0];

  // Soft delete: block the user instead of deleting
  await fetch(`${strapiUrl}/api/users/${strapiUser.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${strapiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      blocked: true,
    }),
  });

  console.log('✅ Blocked Strapi user:', strapiUser.id);
}

/**
 * Handle password reset for migrated WordPress users
 * Removes the migratedFromWordPress flag from publicMetadata
 */
async function handlePasswordReset(clerkId: string) {
  try {
    const user = await clerkClient.users.getUser(clerkId);
    
    if (!user) {
      console.error('❌ User not found:', clerkId);
      return;
    }

    const publicMetadata = user.publicMetadata || {};
    
    // Remove the migration flag
    const updatedMetadata = { ...publicMetadata };
    delete updatedMetadata.migratedFromWordPress;
    
    // Update user metadata in Clerk
    await clerkClient.users.updateUser(clerkId, {
      publicMetadata: updatedMetadata,
    });

    console.log('✅ Removed migratedFromWordPress flag for user:', clerkId);
  } catch (error) {
    console.error('❌ Error removing migration flag:', error);
  }
}

/**
 * Map WordPress role to Clerk role
 * Based on WordPress role mapping defined in Migration_Plan.plan
 */
function mapWordPressRole(wpRole: string): {
  role: 'customer' | 'subscriber';
  subscriptionTier?: string;
  accountStatus?: string;
} {
  switch (wpRole.toLowerCase()) {
    case 'subscriber':
      return { role: 'subscriber', subscriptionTier: 'basic' };
    
    case 'wpfs_bronze':
      return { role: 'subscriber', subscriptionTier: 'bronze' };
    
    case 'wpfs_gold':
      return { role: 'subscriber', subscriptionTier: 'gold' };
    
    case 'pending':
      return { role: 'customer', accountStatus: 'pending' };
    
    case 'wpfs_no_access':
      return { role: 'customer', accountStatus: 'blocked' };
    
    case 'customer':
    default:
      return { role: 'customer' };
  }
}
