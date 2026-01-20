"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import { useSubscription } from "@/hooks/use-subscription";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { signUp, isLoaded, setActive } = useSignUp();
  const { availableSubscriptions, createSubscriptionCheckout } = useSubscription();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  // Redirect signed-in users to video library
  useEffect(() => {
    if (userLoaded && isSignedIn) {
      router.push('/video-library');
    }
  }, [userLoaded, isSignedIn, router]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    
    setIsLoading(true);
    setError("");

    // Validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please enter your full name.");
      setIsLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    if (!agreeToTerms) {
      setError("Please agree to the terms and conditions.");
      setIsLoading(false);
      return;
    }

    try {
      const signUpAttempt = await signUp.create({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        emailAddress: formData.email.toLowerCase().trim(),
        password: formData.password,
      });

      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId });
        
        // Wait for subscriptions to load
        if (availableSubscriptions.length === 0) {
          // Wait a bit and try to redirect anyway
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Automatically redirect to Stripe checkout for the default subscription
        const defaultSubscription = availableSubscriptions[0]; // Get the first/default subscription
        if (defaultSubscription) {
          try {
            const checkoutUrl = await createSubscriptionCheckout(defaultSubscription.documentId);
            window.location.href = checkoutUrl;
          } catch (checkoutError) {
            setError('Failed to start subscription process. Please try again.');
            setIsLoading(false);
          }
        } else {
          setError('Subscription not available. Please contact support.');
          setIsLoading(false);
        }
      } else {
        // If email verification is required, handle it
        setError("Please check your email to verify your account.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "Signup failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleOAuthSignUp = async (strategy: OAuthStrategy) => {
    if (!isLoaded) return;
    
    try {
      await signUp.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/signup-subscription',
      });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "OAuth sign up failed. Please try again.");
    }
  };


  return (
    <div className="login-page">
      <div className="login-background-left"></div>
      <div className="login-background-right"></div>
      
      <div className="signup-container">
        {/* Trial & Pricing Information */}
        <div className="bg-[#f6f5f3] rounded-lg p-6 mb-6 text-center">
          <p className="text-2xl font-serif font-bold text-gray-900 mb-2">
            Get started with a 7-day free trial!
          </p>
          <p className="text-gray-700 pb-0 mb-2">
            No contract membership for only $15 a month.
          </p>
          <p className="text-sm text-gray-600 italic">
            Credit card required to start trial. Cancel anytime before trial ends to avoid charges.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="grid grid-cols-2 gap-3">
            <div className="login-form-group">
              <label htmlFor="firstName" className="login-label">
                First Name *
              </label>
              <Input
                id="firstName"
                type="text"
                value={formData.firstName}
                onChange={(e) => handleInputChange("firstName", e.target.value)}
                className="login-input"
                required
              />
            </div>

            <div className="login-form-group">
              <label htmlFor="lastName" className="login-label">
                Last Name *
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.lastName}
                onChange={(e) => handleInputChange("lastName", e.target.value)}
                className="login-input"
                required
              />
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="login-input"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              Password *
            </label>
            <div className="login-password-wrapper">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className="login-input login-password-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="login-password-toggle"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-blue-500" />
                ) : (
                  <Eye className="h-5 w-5 text-blue-500" />
                )}
              </button>
            </div>
            <small className="signup-password-hint">
              Must be at least 8 characters long
            </small>
          </div>

          <div className="login-form-group">
            <label htmlFor="confirmPassword" className="login-label">
              Confirm Password *
            </label>
            <div className="login-password-wrapper">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                className="login-input login-password-input"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="login-password-toggle"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-blue-500" />
                ) : (
                  <Eye className="h-5 w-5 text-blue-500" />
                )}
              </button>
            </div>
          </div>

          <div className="signup-terms-wrapper">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={agreeToTerms}
                onChange={(e) => setAgreeToTerms(e.target.checked)}
                className="login-remember-input"
              />
              I agree to the <Link href="/terms-subscription" className="signup-link">Terms of Service</Link> and <Link href="/privacy-policy" className="signup-link">Privacy Policy</Link>
            </label>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Clerk CAPTCHA Element */}
          <div id="clerk-captcha" className="mb-2"></div>

          <div className="login-submit-wrapper">
            <Button
              type="submit"
              variant="clean"
              className="login-submit-button"
              disabled={isLoading || !isLoaded}
            >
              {isLoading ? "CREATING ACCOUNT..." : "START FREE TRIAL"}
            </Button>
          </div>
        </form>

        {/* OAuth Divider */}
        <div className="flex items-center gap-4 my-4">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-sm text-gray-500 font-medium">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2 mb-4">
          <button
            type="button"
            onClick={() => handleOAuthSignUp('oauth_google')}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignUp('oauth_apple')}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-sm font-medium text-white">Continue with Apple</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignUp('oauth_facebook')}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-md bg-[#1877F2] hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-sm font-medium text-white">Continue with Facebook</span>
          </button>
        </div>

        <div className="signup-login-link">
          <p>Already have an account? <Link href="/login" className="signup-link">Sign in here</Link></p>
        </div>

        <div className="login-footer">
          <Link href="/" className="login-back-home">
            ← Go to The Piped Peony
          </Link>
        </div>
      </div>
    </div>
  );
}
