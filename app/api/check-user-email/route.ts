import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * API endpoint to check if a user exists and retrieve their migration status
 * Used by the login page to determine if password reset notification should be shown
 */
export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Username or email is required' },
        { status: 400 }
      );
    }

    const identifier = email.trim();
    
    // Check if input is an email (contains @) or a username
    const isEmail = identifier.includes('@');
    
    let users;
    if (isEmail) {
      // Search by email address
      users = await clerkClient.users.getUserList({
        emailAddress: [identifier.toLowerCase()],
        limit: 1
      });
    } else {
      // Search by username
      users = await clerkClient.users.getUserList({
        username: [identifier.toLowerCase()],
        limit: 1
      });
    }

    if (users.length === 0) {
      // User doesn't exist
      return NextResponse.json({
        exists: false,
        migratedFromWordPress: false
      });
    }

    const user = users[0];
    const publicMetadata = user.publicMetadata || {};

    // Check if user is a migrated WordPress user
    const migratedFromWordPress = publicMetadata.migratedFromWordPress === true;
    const originalWordPressRole = publicMetadata.originalWordPressRole || null;
    const accountStatus = publicMetadata.accountStatus || null;

    return NextResponse.json({
      exists: true,
      migratedFromWordPress,
      originalWordPressRole,
      accountStatus,
      // Don't send full user data for security
    });

  } catch (error) {
    console.error('Error checking user identifier:', error);
    return NextResponse.json(
      { error: 'Failed to check user' },
      { status: 500 }
    );
  }
}

