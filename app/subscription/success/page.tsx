"use client"

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSignIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";

function SubscriptionSuccessContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isLoaded: signInLoaded, signIn, setActive } = useSignIn();
  const { isSignedIn } = useUser();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setIsLoading(false);
      return;
    }

    // If already signed in (OAuth flow), redirect to video library
    if (isSignedIn) {
      console.log('✅ User already signed in, redirecting to video library...');
      router.push('/video-library');
      return;
    }

    // Wait for Clerk to load
    if (!signInLoaded) {
      return;
    }

    const authenticateUser = async () => {
      try {
        console.log('🔐 Starting auto-signin process...');
        
        // Poll for the account to be created by webhook (up to 30 seconds)
        let attempts = 0;
        const maxAttempts = 15;
        
        while (attempts < maxAttempts) {
          try {
            console.log(`🔍 Attempt ${attempts + 1}/${maxAttempts}: Checking if account is ready...`);
            
            const response = await fetch('/api/auto-signin', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            });

            if (response.ok) {
              const { token } = await response.json();
              console.log('✅ Got sign-in token, authenticating...');
              
              // Sign in using the token
              const signInAttempt = await signIn.create({
                strategy: 'ticket',
                ticket: token,
              });

              if (signInAttempt.status === 'complete') {
                console.log('✅ Sign-in successful, activating session...');
                await setActive({ session: signInAttempt.createdSessionId });
                console.log('✅ Redirecting to video library...');
                
                // Small delay to ensure session is fully activated
                setTimeout(() => {
                  router.push('/video-library');
                }, 500);
                return;
              }
            }
            
            // Not ready yet, wait and retry
            console.log('⏳ Account not ready yet, waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
            
          } catch (fetchError: any) {
            console.error('Attempt failed:', fetchError);
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
          }
        }
        
        // Timeout - show manual sign-in option
        console.error('❌ Timeout waiting for account creation');
        setError('Account is being created. Please sign in manually.');
        setIsLoading(false);
        
      } catch (err: any) {
        console.error('❌ Authentication error:', err);
        setError('Please sign in manually to access your account.');
        setIsLoading(false);
      }
    };

    authenticateUser();
  }, [sessionId, signInLoaded, signIn, setActive, isSignedIn, router]);

  if (error) {
    // Show error state with manual sign-in option
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-500 mb-4">
            <CheckCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => router.push('/login')}
            className="w-full !bg-[#D4A771] !text-white hover:!bg-[#C69963]"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Loading state - automatically signing in
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md mx-auto px-4">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-6 text-[#D4A771]" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-3">
          Welcome to The Piped Peony!
        </h2>
        <p className="text-gray-600 mb-6">
          Setting up your account and signing you in automatically...
        </p>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-2 text-left">
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">Payment successful</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">Creating your account</span>
            </div>
            <div className="flex items-center text-green-600">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">Activating subscription</span>
            </div>
            <div className="flex items-center text-[#D4A771]">
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              <span className="text-sm">Signing you in...</span>
            </div>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          This usually takes just a few seconds
        </p>
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
