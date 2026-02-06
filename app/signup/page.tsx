"use client"

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { PasswordStrengthMeter } from "@/components/password-strength-meter";

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
  const [isProcessingSignup, setIsProcessingSignup] = useState(false);
  const [showCancelledMessage, setShowCancelledMessage] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  const { signUp, isLoaded, setActive } = useSignUp();
  const { isSignedIn, isLoaded: userLoaded } = useUser();
  const router = useRouter();

  // Check for cancelled checkout in URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('cancelled') === 'true') {
      setShowCancelledMessage(true);
    }
  }, []);

  // Redirect signed-in users to video library (but not if they just signed up and are being redirected to checkout)
  useEffect(() => {
    if (userLoaded && isSignedIn && !isProcessingSignup) {
      router.push('/video-library');
    }
  }, [userLoaded, isSignedIn, isProcessingSignup, router]);

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

    if (passwordStrength < 4) {
      setError("Please use a strong password (green strength indicator) for your account security.");
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
      // Set flag to prevent redirect to video library
      setIsProcessingSignup(true);
        
        console.log('⏳ Fetching subscriptions...');
        
      // NEW APPROACH: Create checkout session BEFORE creating Clerk account
      // This prevents orphaned accounts if users abandon checkout
      
          // Fetch subscriptions directly
          const response = await fetch('/api/subscriptions-list');
          if (!response.ok) {
            throw new Error('Failed to fetch subscriptions');
          }
          
          const data = await response.json();
          const subscriptions = data.subscriptions || [];
          
          console.log('📋 Available subscriptions:', subscriptions.length);
          
          if (subscriptions.length > 0) {
        console.log('💳 Creating checkout session (no account created yet)...');
            
        // Call the NEW guest checkout API that will create Clerk account AFTER payment
        const checkoutResponse = await fetch('/api/guest-checkout', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                subscriptionId: subscriptions[0].documentId,
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.toLowerCase().trim(),
            password: formData.password, // Will be used to create account after payment
              }),
            });

            if (!checkoutResponse.ok) {
              const error = await checkoutResponse.json();
              
              // Handle duplicate email specifically with a helpful message
              if (checkoutResponse.status === 409) {
                throw new Error(error.error || 'This email is already registered.');
              }
              
              throw new Error(error.error || 'Failed to create checkout session');
            }

            const { url } = await checkoutResponse.json();
            console.log('✅ Checkout URL created:', url);
        console.log('ℹ️  Account will be created after successful payment');
            // Redirect to Stripe
            window.location.href = url;
            // Keep loading state while redirecting
            return;
          } else {
            console.error('❌ No subscriptions available');
            setError('No subscription plans available. Please contact support.');
        setIsLoading(false);
        setIsProcessingSignup(false);
      }
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err?.message || "Signup failed. Please try again.");
      setIsLoading(false);
      setIsProcessingSignup(false);
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

        {/* Show message if user cancelled checkout */}
        {showCancelledMessage && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-amber-800 text-sm">
              <strong>Checkout cancelled.</strong> No account was created. Please complete the signup process to access your free trial.
            </p>
          </div>
        )}

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
            <PasswordStrengthMeter 
              password={formData.password}
              email={formData.email}
              firstName={formData.firstName}
              lastName={formData.lastName}
              onStrengthChange={setPasswordStrength}
            />
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
              disabled={isLoading || !isLoaded || (formData.password.length >= 8 && passwordStrength < 4)}
            >
              {isLoading ? "CREATING ACCOUNT..." : "START FREE TRIAL"}
            </Button>
            {formData.password.length >= 8 && passwordStrength < 4 && (
              <p className="text-sm text-red-600 mt-2 text-center">
                ⚠️ Password must be strong (green indicator) to continue
              </p>
            )}
          </div>
        </form>

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
