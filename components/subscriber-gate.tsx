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
  const { isSubscriber, isLoaded } = useRole();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && !isSubscriber) {
      // Redirect to upgrade page with current path as redirect_url
      const currentPath = window.location.pathname;
      router.push(`${redirectTo}?redirect_url=${encodeURIComponent(currentPath)}`);
    }
  }, [isSubscriber, isLoaded, router, redirectTo]);

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

  // Don't render children if not a subscriber (will redirect)
  if (!isSubscriber) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <Crown className="w-16 h-16 text-[#D4A771] mx-auto mb-4" />
          <h2 className="text-2xl font-serif text-gray-900 mb-4">Subscriber Access Required</h2>
          <p className="text-gray-600 mb-6">
            This content is only available to subscribers. Redirecting to upgrade page...
          </p>
        </div>
      </div>
    );
  }

  // Render children if subscriber
  return <>{children}</>;
}

