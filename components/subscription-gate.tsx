"use client"

import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Lock, Crown, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import SubscriptionPlans from "./subscription-plans";

interface SubscriptionGateProps {
  children: React.ReactNode;
  requiredRole?: 'Customer' | 'Subscriber';
  fallbackContent?: React.ReactNode;
  redirectTo?: string;
}

export default function SubscriptionGate({ 
  children, 
  requiredRole = 'Subscriber',
  fallbackContent,
  redirectTo
}: SubscriptionGateProps) {
  const { user, isLoaded: userLoaded } = useUser();
  const { hasAccess, loading: subscriptionLoading, isSubscriber } = useSubscription();
  const router = useRouter();
  const [showUpgrade, setShowUpgrade] = useState(false);

  useEffect(() => {
    if (userLoaded && !user && redirectTo) {
      router.push(redirectTo);
    }
  }, [user, userLoaded, redirectTo, router]);

  // Show loading state
  if (!userLoaded || subscriptionLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  // User not logged in
  if (!user) {
    return (
      <div className="text-center py-12 px-4">
        <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Sign In Required
        </h2>
        <p className="text-gray-600 mb-6">
          Please sign in to access this content.
        </p>
        <div className="space-y-3">
          <Button onClick={() => router.push('/login')}>
            Sign In
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/signup')}
          >
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  // Check if user has required access
  if (hasAccess(requiredRole)) {
    return <>{children}</>;
  }

  // Show upgrade prompt for subscribers-only content
  if (requiredRole === 'Subscriber' && !isSubscriber) {
    if (showUpgrade) {
      return (
        <div className="py-8">
          <div className="text-center mb-8">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Upgrade to Premium
            </h2>
            <p className="text-gray-600 mb-6">
              This content is available to premium subscribers only.
            </p>
            <Button 
              variant="outline" 
              onClick={() => setShowUpgrade(false)}
              className="mb-6"
            >
              ← Back
            </Button>
          </div>
          
          <SubscriptionPlans />
        </div>
      );
    }

    return fallbackContent || (
      <div className="text-center py-12 px-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border">
        <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Premium Content
        </h2>
        <p className="text-gray-600 mb-6">
          This exclusive content is available to premium subscribers only. 
          Upgrade your account to unlock advanced courses, tutorials, and community features.
        </p>
        <div className="space-y-3">
          <Button onClick={() => setShowUpgrade(true)}>
            <Crown className="h-4 w-4 mr-2" />
            View Subscription Plans
          </Button>
          <Button 
            variant="outline" 
            onClick={() => router.push('/shop')}
          >
            Browse Free Content
          </Button>
        </div>
        
        <div className="mt-8 p-4 bg-white rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-2">Premium Benefits Include:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Access to all premium courses and tutorials</li>
            <li>• Exclusive community features and forums</li>
            <li>• Priority customer support</li>
            <li>• Early access to new content</li>
            <li>• Downloadable resources and templates</li>
          </ul>
        </div>
      </div>
    );
  }

  // Fallback for other access issues
  return fallbackContent || (
    <div className="text-center py-12 px-4">
      <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Access Restricted
      </h2>
      <p className="text-gray-600 mb-6">
        You don't have permission to view this content.
      </p>
      <Button onClick={() => router.push('/')}>
        Go Home
      </Button>
    </div>
  );
}
