"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Crown, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useRole } from "@/hooks/use-role"
import { Suspense, useEffect, useState } from "react"
import { PeonyLoader } from "@/components/ui/peony-loader"
import { useUser } from "@clerk/nextjs"

function UpgradeContent() {
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect_url') || '/shop'
  const { isSubscriber } = useRole()
  const { user } = useUser()
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<any>(null)
  const [isRedirecting, setIsRedirecting] = useState(false)

  // Automatically redirect to Stripe checkout
  useEffect(() => {
    const redirectToCheckout = async () => {
      if (isSubscriber) return; // Don't redirect if already subscribed
      if (!user) return; // Wait for user to load
      if (isRedirecting) return; // Prevent duplicate attempts
      
      setIsRedirecting(true);
      
      try {
        // Fetch subscriptions
        const response = await fetch('/api/subscriptions-list');
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }
        
        const { subscriptions } = await response.json();
        
        if (subscriptions && subscriptions.length > 0) {
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
            console.error('Checkout error:', error);
            // Show error message with details
            setCheckoutError(error.error || 'Failed to create checkout session');
            setErrorDetails(error);
            setIsRedirecting(false);
            return;
          }

          const { url } = await checkoutResponse.json();
          console.log('Redirecting to checkout:', url);
          window.location.href = url;
        } else {
          setCheckoutError('No subscription plans available');
          setIsRedirecting(false);
        }
      } catch (error: any) {
        console.error('Error redirecting to checkout:', error);
        setCheckoutError(error.message || 'An error occurred');
        setIsRedirecting(false);
      }
    };

    redirectToCheckout();
  }, [isSubscriber, user, isRedirecting]);

  if (isSubscriber) {
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <Crown className="w-16 h-16 text-[#D4A771] mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-gray-900 mb-4">You're Already a Subscriber!</h1>
          <p className="text-gray-600 mb-6">You have full access to all premium content.</p>
          <Link href={redirectPath}>
            <Button className="!bg-[#D4A771] !text-white hover:!bg-[#C69963]">
              Continue to Content
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // Show error state if checkout creation failed
  if (checkoutError) {
    // Determine error type and appropriate message
    const actionRequired = errorDetails?.actionRequired;
    const subscriptionStatus = errorDetails?.subscriptionStatus;
    
    let title = 'Unable to Create Checkout';
    let subtitle = checkoutError;
    let helpText = 'Please contact support for assistance.';
    let primaryButtonText = 'Go to My Account';
    let primaryButtonHref = '/my-account';
    
    // Customize message based on subscription status
    if (actionRequired === 'update_payment' || subscriptionStatus === 'past_due') {
      title = 'Payment Failed';
      subtitle = 'Your last payment didn\'t go through, so your subscription is on hold.';
      helpText = 'Please update your payment method in your account to restore access to all content.';
      primaryButtonText = 'Update Payment Method';
      primaryButtonHref = '/my-account';
    } else if (actionRequired === 'retry_signup' || subscriptionStatus === 'incomplete') {
      title = 'Signup Not Completed';
      subtitle = 'Your previous signup wasn\'t finished.';
      helpText = 'You can try signing up again, or contact support if you need help.';
      primaryButtonText = 'Try Again';
      primaryButtonHref = '/signup';
    } else if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
      title = 'Already Subscribed';
      subtitle = 'You already have an active subscription.';
      helpText = 'Manage your subscription or contact support if you think this is an error.';
      primaryButtonText = 'Manage Subscription';
      primaryButtonHref = '/my-account';
    }
    
    return (
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center px-4">
        <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h1 className="text-2xl font-serif text-gray-900 mb-4">{title}</h1>
          <p className="text-gray-900 font-medium mb-2">{subtitle}</p>
          <p className="text-sm text-gray-600 mb-6">{helpText}</p>
          
          <div className="space-y-3">
            <Link href={primaryButtonHref}>
              <Button className="w-full !bg-[#D4A771] !text-white hover:!bg-[#C69963]">
                {primaryButtonText}
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
            {(actionRequired === 'update_payment' || subscriptionStatus === 'past_due') && (
              <p className="text-xs text-gray-500 mt-4">
                Need help? <Link href="/contact" className="text-[#D4A771] hover:underline">Contact support</Link>
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Show loading state while redirecting to checkout
  return (
    <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
      <div className="text-center">
        <PeonyLoader />
        <p className="mt-4 text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  )
}

export default function UpgradePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <UpgradeContent />
    </Suspense>
  )
}
