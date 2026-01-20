"use client"

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { PeonyLoader } from '@/components/ui/peony-loader';

export default function SSOCallbackPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    const checkSubscriptionAndRedirect = async () => {
      if (!isLoaded || !user) {
        return;
      }

      // Wait a moment for Clerk to fully set up the session
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check if user has subscriber role
      const userRole = user.publicMetadata?.role as string;
      
      if (userRole === 'Subscriber') {
        // User is already a subscriber, redirect to video library
        router.push('/video-library');
      } else {
        // User is not a subscriber, redirect to subscription checkout
        router.push('/signup-subscription');
      }
    };

    checkSubscriptionAndRedirect();
  }, [user, isLoaded, router]);

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
      <div className="text-center">
        <PeonyLoader />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}

