import { NextRequest, NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get the role from the request body
    const { role } = await request.json();
    
    // Validate role
    if (!role || !['customer', 'subscriber'].includes(role.toLowerCase())) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "customer" or "subscriber"' },
        { status: 400 }
      );
    }

    const normalizedRole = role.toLowerCase();

    console.log(`🔄 Setting user ${userId} role to: ${normalizedRole}`);

    // Update user metadata in Clerk
    await clerkClient().users.updateUserMetadata(userId, {
      publicMetadata: {
        role: normalizedRole,
      },
    });

    console.log(`✅ Successfully set user ${userId} role to: ${normalizedRole}`);

    return NextResponse.json({ 
      success: true,
      role: normalizedRole,
      message: `Role set to ${normalizedRole}` 
    });
  } catch (error: any) {
    console.error('❌ Error setting user role:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to set user role' },
      { status: 500 }
    );
  }
}

