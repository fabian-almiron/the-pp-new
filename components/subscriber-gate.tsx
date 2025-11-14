"use client"

import { useRole } from "@/hooks/use-role";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Crown } from "lucide-react";

interface SubscriberGateProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function SubscriberGate({ children, redirectTo = "/upgrade" }: SubscriberGateProps) {
  const { isSubscriber, isLoaded, isSignedIn } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded) {
      // If not signed in, redirect to signup
      if (!isSignedIn) {
        const currentPath = window.location.pathname;
        router.push(`/signup?redirect_url=${encodeURIComponent(currentPath)}`);
      }
      // If signed in but not a subscriber, redirect to upgrade
      else if (!isSubscriber) {
        const currentPath = window.location.pathname;
        router.push(`${redirectTo}?redirect_url=${encodeURIComponent(currentPath)}`);
      }
    }
  }, [isSubscriber, isSignedIn, isLoaded, router, redirectTo]);

  // Show loading state while checking
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not signed in or not a subscriber (will redirect)
  if (!isSignedIn || !isSubscriber) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Crown className="w-16 h-16 text-[#D4A771] mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-gray-900 mb-4">
            {!isSignedIn ? "Sign In Required" : "Subscriber Access Required"}
          </h2>
          <p className="text-gray-600 mb-6">
            {!isSignedIn 
              ? "Please sign in to access course content. Redirecting to signup page..."
              : "This content is only available to subscribers. Redirecting to upgrade page..."
            }
          </p>
        </div>
      </div>
    );
  }

  // Render children if subscriber
  return <>{children}</>;
}

