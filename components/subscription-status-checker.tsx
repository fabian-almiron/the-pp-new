"use client"

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Component that automatically checks Stripe for active subscriptions
 * and updates the user's role in Clerk when they log in.
 * Only runs once per browser session.
 */
export function SubscriptionStatusChecker() {
  const { isSignedIn, isLoaded, user } = useUser();

  useEffect(() => {
    const checkSubscriptionRole = async () => {
      if (!isLoaded || !isSignedIn || !user) {
        return;
      }

      // Check if we've already done this check in this session
      const checkKey = `subscription_checked_${user.id}`;
      const hasChecked = sessionStorage.getItem(checkKey);
      
      if (hasChecked) {
        console.log('⏭️ Subscription already checked this session');
        return;
      }

      try {
        console.log('🔍 Checking subscription status for user:', user.id);
        
        const response = await fetch('/api/fix-subscription-role', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Subscription check complete:', data);
          
          // If role was updated, reload user data
          if (data.newRole !== data.previousRole) {
            console.log(`🔄 Role updated from ${data.previousRole} to ${data.newRole}`);
            await user.reload();
          }
          
          // Mark as checked for this session
          sessionStorage.setItem(checkKey, 'true');
        }
      } catch (error) {
        console.error('❌ Error checking subscription role:', error);
        // Silently fail - don't disrupt user experience
      }
    };

    checkSubscriptionRole();
  }, [isLoaded, isSignedIn, user]);

  // This component doesn't render anything
  return null;
}
