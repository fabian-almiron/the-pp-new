"use client"

import { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import { useSignIn } from "@clerk/nextjs";
import PasswordResetModal from "@/components/password-reset-modal";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMigrationNotice, setShowMigrationNotice] = useState(false);
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
          "Unable to sign in. If you had an account before our recent upgrade, please reset your password."
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
              you'll need to reset your password to access your account.
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
