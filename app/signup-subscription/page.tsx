"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useSubscription } from "@/hooks/use-subscription";
import { PeonyLoader } from "@/components/ui/peony-loader";

export default function SignupSubscriptionPage() {
  const [error, setError] = useState("");
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();
  const { isSubscriber } = useSubscription();
  const router = useRouter();

  useEffect(() => {
    const redirectToCheckout = async () => {
      // Wait for everything to load
      if (!userLoaded || !user) {
        return;
      }

      // If not signed in, redirect to signup
      if (!isSignedIn) {
        router.push('/signup');
        return;
      }

      // If already a subscriber, redirect to video library
      if (isSubscriber) {
        router.push('/video-library');
        return;
      }

      try {
        // Fetch subscriptions directly
        const response = await fetch('/api/subscriptions-list');
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }
        
        const data = await response.json();
        const subscriptions = data.subscriptions || [];
        
        if (subscriptions.length > 0) {
          console.log('Creating checkout for subscription:', subscriptions[0].documentId);
          
          // Call the subscription checkout API directly
          const checkoutResponse = await fetch('/api/subscription-checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              subscriptionId: subscriptions[0].documentId,
              userId: user.id,
              userEmail: user.emailAddresses[0]?.emailAddress,
            }),
          });

          if (!checkoutResponse.ok) {
            const error = await checkoutResponse.json();
            throw new Error(error.error || 'Failed to create checkout session');
          }

          const { url } = await checkoutResponse.json();
          console.log('Redirecting to checkout:', url);
          window.location.href = url;
        } else {
          setError('Subscription not available. Please contact support.');
        }
      } catch (err: any) {
        console.error('Failed to create checkout session:', err);
        setError('Failed to start subscription process. Please try again or contact support.');
      }
    };

    redirectToCheckout();
  }, [userLoaded, user, isSignedIn, isSubscriber, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
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
            <a 
              href="mailto:support@thepipedpeony.com"
              className="block w-full bg-[#D4A771] text-white py-3 px-4 rounded-md hover:bg-[#C69963] transition-colors"
            >
              Contact Support
            </a>
            <button
              onClick={() => router.push('/signup')}
              className="block w-full text-sm text-gray-600 hover:underline"
            >
              Return to Sign Up
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
      <div className="text-center">
        <PeonyLoader />
        <h2 className="text-xl font-semibold text-gray-900 mb-2 mt-4">
          Setting up your subscription...
        </h2>
        <p className="text-gray-600">
          Please wait while we redirect you to complete your payment.
        </p>
      </div>
    </div>
  );
}
