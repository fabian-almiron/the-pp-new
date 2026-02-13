import { NextResponse } from 'next/server';
import { auth, clerkClient } from '@clerk/nextjs/server';

/**
 * API endpoint to clear the migratedFromWordPress flag after successful password reset
 * This prevents migrated users from being prompted to reset password on every login
 */
export async function POST() {
  try {
    // Get the authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get current user metadata
    const user = await clerkClient().users.getUser(userId);
    const currentPublicMetadata = user.publicMetadata || {};

    // Remove the migratedFromWordPress flag if it exists
    if (currentPublicMetadata.migratedFromWordPress) {
      const { migratedFromWordPress, ...restMetadata } = currentPublicMetadata;
      
      await clerkClient().users.updateUserMetadata(userId, {
        publicMetadata: restMetadata,
      });
      
      console.log(`✅ Cleared migration flag for user: ${userId}`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Migration flag cleared' 
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'No migration flag found' 
    });

  } catch (error) {
    console.error('❌ Error clearing migration flag:', error);
    return NextResponse.json(
      { error: 'Failed to clear migration flag' },
      { status: 500 }
    );
  }
}
