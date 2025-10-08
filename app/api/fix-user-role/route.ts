import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { clerkUserId, role } = await request.json();
    
    console.log(`🔧 Fixing user role for ${clerkUserId} to ${role}`);
    
    await clerkClient.users.updateUserMetadata(clerkUserId, {
      publicMetadata: {
        role: role,
      },
    });
    
    console.log(`✅ Successfully updated Clerk user ${clerkUserId} to ${role}`);
    
    return NextResponse.json({ success: true, message: `User role updated to ${role}` });
  } catch (error) {
    console.error('❌ Error fixing user role:', error);
    return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
  }
}
