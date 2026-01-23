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
  const { isSignedIn, user } = useUser();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found");
      setIsLoading(false);
      return;
    }

    // If already signed in, redirect to video library
    if (isSignedIn && user) {
      console.log('✅ User already signed in, redirecting to video library...');
      router.push('/video-library');
      return;
    }

    // If not signed in, get the sign-in token and authenticate
    if (!signInLoaded) {
      return; // Wait for Clerk to load
    }

    const authenticateUser = async () => {
      try {
        console.log('🔐 Attempting to sign in user after successful payment...');
        console.log('📋 Session ID:', sessionId);
        
        // Poll for sign-in token (webhook might take a moment)
        let attempts = 0;
        const maxAttempts = 15; // Try for 30 seconds
        
        while (attempts < maxAttempts) {
          try {
            console.log(`🔍 Attempt ${attempts + 1}/${maxAttempts}: Fetching sign-in token...`);
            
            const response = await fetch('/api/get-signin-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ sessionId }),
            });

            if (response.ok) {
              const { signInToken } = await response.json();
              console.log('✅ Got sign-in token, authenticating...');
              
              // Sign in using the token
              const signInAttempt = await signIn.create({
                strategy: 'ticket',
                ticket: signInToken,
              });

              if (signInAttempt.status === 'complete') {
                console.log('✅ Sign-in successful, setting active session...');
                await setActive({ session: signInAttempt.createdSessionId });
                console.log('✅ Session activated, redirecting to video library...');
                
                // Redirect to video library
                router.push('/video-library');
                return;
              } else {
                throw new Error('Sign-in not complete');
              }
            }
            
            // Token not ready yet, wait and retry
            console.log('⏳ Token not ready yet, waiting 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
            
          } catch (fetchError: any) {
            console.error('Fetch attempt failed:', fetchError);
            await new Promise(resolve => setTimeout(resolve, 2000));
            attempts++;
          }
        }
        
        // If we get here, token retrieval timed out
        console.error('❌ Timed out waiting for sign-in token');
        setError('Account created successfully, but automatic login failed. Please sign in manually.');
        setIsLoading(false);
        
      } catch (err: any) {
        console.error('❌ Authentication error:', err);
        setError('Account created successfully, but automatic login failed. Please sign in manually.');
        setIsLoading(false);
      }
    };

    authenticateUser();
  }, [sessionId, signInLoaded, signIn, setActive, isSignedIn, user, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-amber-500 mb-4">
            <CheckCircle className="h-12 w-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Payment Successful!
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Button
              onClick={() => router.push('/login')}
              className="w-full !bg-[#D4A771] !text-white hover:!bg-[#C69963]"
            >
              Sign In Manually
            </Button>
            <Link href="/" className="block text-sm text-[#D4A771] hover:underline">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Loading state - user will be automatically redirected
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#D4A771]" />
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Welcome to The Piped Peony!
        </h2>
        <p className="text-gray-600 mb-4">
          Setting up your account and signing you in...
        </p>
        <div className="bg-[#FBF9F6] border border-[#D4A771] rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-gray-700">
            ✓ Payment successful<br />
            ✓ Creating your account<br />
            ✓ Activating subscription<br />
            ⏳ Signing you in...
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
