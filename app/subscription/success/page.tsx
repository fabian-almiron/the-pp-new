"use client"

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

function SubscriptionSuccessContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscriber, setIsSubscriber] = useState(false);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useUser();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setIsLoading(false);
      return;
    }

    if (!user) {
      return; // Wait for user to load
    }

    // Verify the subscription was created successfully by checking Clerk metadata
    const verifySubscription = async () => {
      try {
        // Give Stripe webhook time to process and update Clerk metadata
        // Poll for up to 30 seconds to check if role has been updated
        let attempts = 0;
        const maxAttempts = 15;
        
        while (attempts < maxAttempts) {
          await user.reload(); // Reload user data from Clerk
          
          const userRole = user.publicMetadata?.role as string;
          console.log('Checking subscription status, attempt', attempts + 1, 'Role:', userRole);
          
          if (userRole === 'Subscriber') {
            setIsSubscriber(true);
            setIsLoading(false);
            return;
          }
          
          // Wait 2 seconds before next check
          await new Promise(resolve => setTimeout(resolve, 2000));
          attempts++;
        }
        
        // After 30 seconds, assume success anyway (webhook might be delayed)
        // Most users will see success immediately, but some may need to refresh
        setIsSubscriber(true);
        setIsLoading(false);
        
      } catch (err) {
        console.error('Subscription verification error:', err);
        // Don't show error - assume success since payment went through
        setIsSubscriber(true);
        setIsLoading(false);
      }
    };

    verifySubscription();
  }, [sessionId, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Processing your subscription...
          </h2>
          <p className="text-gray-600">
            Please wait while we set up your account.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Subscription Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/signup')}
              className="w-full"
            >
              Try Again
            </Button>
            <Link href="/" className="block text-sm text-blue-600 hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{
        backgroundColor: '#f6f5f3',
        backgroundImage: 'url(/background_peony-petals.webp)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="text-green-500 mb-6">
          <CheckCircle className="h-16 w-16 mx-auto" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome to The Piped Peony Academy!
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your subscription has been activated successfully. You now have access to all premium content and courses.
        </p>

        <div className="bg-[#FBF9F6] border border-[#D4A771] rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-gray-900 mb-2">What's Included:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Full video library access</li>
            <li>✓ Academy courses and tutorials</li>
            <li>✓ Color and recipe libraries</li>
            <li>✓ Premium category content</li>
            <li>✓ Priority support</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => router.push('/video-library')}
            className="w-full !bg-[#D4A771] !text-white hover:!bg-[#C69963]"
            size="lg"
          >
            Start Learning
          </Button>
          
          <Link href="/my-account" className="block text-sm text-[#D4A771] hover:underline">
            View My Account
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Questions? Contact us at{" "}
            <a href="mailto:support@thepipedpeony.com" className="text-[#D4A771] hover:underline">
              support@thepipedpeony.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SubscriptionSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <SubscriptionSuccessContent />
    </Suspense>
  );
}
