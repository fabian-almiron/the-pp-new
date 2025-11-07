"use client"

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import { OAuthStrategy } from "@clerk/types";
import PasswordResetModal from "@/components/password-reset-modal";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMigrationNotice, setShowMigrationNotice] = useState(true);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetModalEmail, setResetModalEmail] = useState("");
  const [showResetMigrationMessage, setShowResetMigrationMessage] = useState(false);
  
  const { signIn, isLoaded, setActive } = useSignIn();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/video-library';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    
    setIsLoading(true);
    setError("");

    try {
      const signInAttempt = await signIn.create({
        identifier: email,
        password,
      });

      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId });
        
        // Wait a bit for session to be fully set, especially important on mobile/incognito
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Force a hard navigation to ensure session is picked up
        window.location.href = redirectUrl;
      } else {
        setError("Unable to complete sign in. Please try again.");
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.message || "";
      const errorCode = err?.errors?.[0]?.code || "";
      
      // Check if this is a "user not found" error (account doesn't exist)
      const isUserNotFound = 
        errorCode === 'form_identifier_not_found' ||
        errorMessage.toLowerCase().includes('not found') ||
        errorMessage.toLowerCase().includes('no account') ||
        errorMessage.toLowerCase().includes('couldn\'t find') ||
        errorMessage.toLowerCase().includes('identifier');
      
      // Only open password reset modal if:
      // 1. User attempted login (we're in handleSubmit) ✓
      // 2. Login failed (we're in catch block) ✓
      // 3. Account EXISTS in database (NOT a "user not found" error) ✓
      // 4. Issue is password-specific ✓
      if (!isUserNotFound && 
          (errorCode === 'form_password_incorrect' || 
           errorMessage.toLowerCase().includes('password is incorrect') ||
           errorMessage.toLowerCase().includes('no password') ||
           errorMessage.toLowerCase().includes('password not set'))) {
        
        // Automatically open the password reset modal for migrated users
        setResetModalEmail(email);
        setShowResetMigrationMessage(true);
        setShowResetModal(true);
        setError(
          "It looks like you need to set up a password for our new system. We've opened the password reset form for you."
        );
      } else if (!isUserNotFound && 
                 (errorMessage.toLowerCase().includes('password') || 
                  errorMessage.toLowerCase().includes('credentials'))) {
        // User exists but generic password/credential error
        setError(
          "Unable to sign in. If you had an account before our recent upgrade, please reset your password or use social login."
        );
      } else if (isUserNotFound) {
        // User doesn't exist - don't suggest password reset
        setError("No account found with that username or email. Please check your credentials or sign up.");
      } else {
        // Generic error fallback
        setError(errorMessage || "Unable to sign in. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (strategy: OAuthStrategy) => {
    if (!isLoaded) return;
    
    try {
      await signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/video-library',
      });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || "OAuth sign in failed. Please try again.");
    }
  };

  return (
    <div 
      className="login-page"
      style={{ backgroundImage: 'url(/archive-header-bg.svg)', backgroundSize: '100%', backgroundPosition: 'center' }}
    >
      <div className="login-background-left"></div>
      <div className="login-background-right"></div>
      
      <div className="login-container">
        {/* Migration Notice Banner */}
        {showMigrationNotice && (
          <div className="migration-notice">
            <div className="migration-notice-header">
              <h3>Welcome to Our Improved Login System</h3>
              <button 
                onClick={() => setShowMigrationNotice(false)}
                className="migration-notice-close"
                aria-label="Close notice"
              >
                ×
              </button>
            </div>
            <p className="migration-notice-text">
              We've upgraded to a more secure authentication system. If you had an account with us before, 
              you'll need to reset your password or use one of our convenient social login options below.
            </p>
            <div className="migration-notice-actions">
              <button 
                type="button"
                onClick={() => {
                  setShowMigrationNotice(false);
                  setResetModalEmail("");
                  setShowResetMigrationMessage(false);
                  setShowResetModal(true);
                }}
                className="migration-notice-link"
              >
                Reset Password
              </button>
              <span className="migration-notice-divider">or</span>
              <button 
                type="button"
                onClick={() => {
                  setShowMigrationNotice(false);
                  // Scroll to OAuth buttons
                  setTimeout(() => {
                    document.querySelector('.oauth-buttons')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="migration-notice-link"
              >
                Use Social Login
              </button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="login-form-group">
            <label htmlFor="email" className="login-label">
              Username or Email Address
            </label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              placeholder="Enter username or email"
              required
            />
          </div>

          <div className="login-form-group">
            <label htmlFor="password" className="login-label">
              Password
            </label>
            <div className="login-password-wrapper">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
          </div>

          <div className="login-remember-wrapper">
            <label className="login-remember">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="login-remember-input"
              />
              Remember Me
            </label>
          </div>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <div className="login-submit-wrapper">
            <Button
              type="submit"
              variant="clean"
              className="login-submit-button"
              disabled={isLoading || !isLoaded}
            >
              {isLoading ? "LOGGING IN..." : "LOG IN"}
            </Button>
          </div>
        </form>

        {/* OAuth Divider */}
        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="text-sm text-gray-500 font-medium">OR</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* OAuth Buttons */}
        <div className="oauth-buttons space-y-3 mb-6">
          <button
            type="button"
            onClick={() => handleOAuthSignIn('oauth_google')}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
            onClick={() => handleOAuthSignIn('oauth_apple')}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md bg-black hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09l-.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            <span className="text-sm font-medium text-white">Continue with Apple</span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuthSignIn('oauth_facebook')}
            disabled={!isLoaded}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-md bg-[#1877F2] hover:bg-[#166FE5] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span className="text-sm font-medium text-white">Continue with Facebook</span>
          </button>
        </div>

        <div className="login-footer">
          <button 
            type="button"
            onClick={() => {
              setResetModalEmail("");
              setShowResetMigrationMessage(false);
              setShowResetModal(true);
            }}
            className="login-forgot-password"
          >
            Forgot your password?
          </button>
          <Link href="/signup" className="login-forgot-password">
            Don't have an account? Sign up
          </Link>
          <Link href="/" className="login-back-home">
            ← Go to The Piped Peony
          </Link>
        </div>
      </div>
      
      {/* Password Reset Modal */}
      <PasswordResetModal 
        isOpen={showResetModal}
        onClose={() => {
          setShowResetModal(false);
          setResetModalEmail("");
          setShowResetMigrationMessage(false);
        }}
        prefilledEmail={resetModalEmail}
        showMigrationMessage={showResetMigrationMessage}
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
