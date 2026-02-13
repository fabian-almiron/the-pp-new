"use client"

import { useState, useEffect } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSignIn } from '@clerk/nextjs';
import { PasswordStrengthMeter } from '@/components/password-strength-meter';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  showMigrationMessage?: boolean;
  prefilledEmail?: string;
}

type ResetStep = 'email' | 'code' | 'password' | 'success';

export default function PasswordResetModal({ 
  isOpen, 
  onClose, 
  showMigrationMessage = false,
  prefilledEmail = ''
}: PasswordResetModalProps) {
  const [step, setStep] = useState<ResetStep>('email');
  const [email, setEmail] = useState(prefilledEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [passwordStrength, setPasswordStrength] = useState<number>(0);
  
  const { signIn, isLoaded, setActive } = useSignIn();

  // Update email when prefilledEmail prop changes
  useEffect(() => {
    if (prefilledEmail) {
      setEmail(prefilledEmail);
    }
  }, [prefilledEmail]);

  // Step 1: Send code to email
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    if (!email.trim()) {
      setErrorMessage('Please enter your username or email address.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Create password reset request with code
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });

      // Success - move to code entry step
      setStep('code');
      
    } catch (err: any) {
      // Check for specific error messages from Clerk
      const clerkError = err?.errors?.[0]?.message || '';
      
      if (clerkError.toLowerCase().includes('not found') || 
          clerkError.toLowerCase().includes('no account') ||
          clerkError.toLowerCase().includes('identifier')) {
        setErrorMessage('No account found with this username or email address.');
      } else {
        setErrorMessage(clerkError || 'Unable to send reset code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify code and move to password entry
  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !signIn) return;
    if (!code.trim() || code.length !== 6) {
      setErrorMessage('Please enter the 6-digit code.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Attempt first reset - this validates the code
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code: code.trim(),
      });

      // If code is valid, move to password entry
      if (result.status === 'needs_new_password') {
        setStep('password');
      } else {
        setErrorMessage('Invalid code. Please try again.');
      }
      
    } catch (err: any) {
      const clerkError = err?.errors?.[0]?.message || '';
      
      if (clerkError.toLowerCase().includes('invalid') || 
          clerkError.toLowerCase().includes('incorrect') ||
          clerkError.toLowerCase().includes('code')) {
        setErrorMessage('Invalid code. Please check and try again.');
      } else if (clerkError.toLowerCase().includes('expired')) {
        setErrorMessage('Code has expired. Please request a new one.');
      } else {
        setErrorMessage(clerkError || 'Unable to verify code. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set new password
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !signIn) return;
    
    // Validation
    if (!newPassword || newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (passwordStrength < 4) {
      setErrorMessage('Please use a strong password (green strength indicator) for your account security.');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Reset the password
      const result = await signIn.resetPassword({
        password: newPassword,
      });

      // If successful, set the session and show success
      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        
        // Clear migration flag if it exists (for WordPress migrated users)
        // This ensures they won't be prompted to reset password on every login
        try {
          const response = await fetch('/api/clear-migration-flag', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
          });
          if (response.ok) {
            console.log('✅ Migration flag cleared');
          }
        } catch (error) {
          console.error('Failed to clear migration flag:', error);
          // Don't fail the whole flow if this fails
        }
        
        setStep('success');
        
        // Auto-close after 3 seconds
        setTimeout(() => {
          onClose();
          resetForm();
          // Redirect to video library or home
          window.location.href = '/video-library';
        }, 3000);
      }
      
    } catch (err: any) {
      const clerkError = err?.errors?.[0]?.message || '';
      setErrorMessage(clerkError || 'Unable to reset password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep('email');
    setEmail('');
    setCode('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMessage('');
    setIsLoading(false);
    setPasswordStrength(0);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await signIn?.create({
        strategy: 'reset_password_email_code',
        identifier: email.trim(),
      });
      setErrorMessage('');
      // Show brief success message
      const temp = errorMessage;
      setErrorMessage('Code resent! Check your email.');
      setTimeout(() => setErrorMessage(temp), 3000);
    } catch (err: any) {
      setErrorMessage('Unable to resend code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // Render appropriate step
  const renderStep = () => {
    switch (step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit}>
            {showMigrationMessage && (
              <div className="password-reset-migration-notice">
                <h4 className="password-reset-migration-title">Welcome to Our Improved Login System</h4>
                <p className="password-reset-migration-text">
                  We've upgraded to a more secure authentication system. Please set up a password for your account to continue.
                </p>
              </div>
            )}

            <p className="password-reset-description">
              Enter your username or email address and we'll send you a 6-digit code to reset your password.
            </p>

            <div className="password-reset-form-group">
              <label htmlFor="reset-email" className="password-reset-label">
                Username or Email Address
              </label>
              <Input
                id="reset-email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="password-reset-input"
                placeholder="Enter username or email"
                required
                disabled={isLoading}
                autoFocus
              />
            </div>

            {errorMessage && (
              <div className="password-reset-error">
                {errorMessage}
              </div>
            )}

            <div className="password-reset-actions">
              <Button
                type="submit"
                variant="default"
                className="password-reset-submit"
                disabled={isLoading || !isLoaded}
              >
                {isLoading ? 'Sending...' : 'Send Code'}
              </Button>
              <button
                type="button"
                onClick={handleClose}
                className="password-reset-cancel"
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        );

      case 'code':
        return (
          <form onSubmit={handleCodeSubmit}>
            <p className="password-reset-description">
              We've sent a 6-digit code to the email address associated with <strong>{email}</strong>. Please enter it below.
            </p>

            <div className="password-reset-form-group">
              <label htmlFor="reset-code" className="password-reset-label">
                6-Digit Code
              </label>
              <Input
                id="reset-code"
                type="text"
                value={code}
                onChange={(e) => {
                  // Only allow numbers and limit to 6 digits
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setCode(value);
                }}
                className="password-reset-input password-reset-code-input"
                placeholder="000000"
                required
                disabled={isLoading}
                maxLength={6}
                autoFocus
              />
            </div>

            {errorMessage && (
              <div className="password-reset-error">
                {errorMessage}
              </div>
            )}

            <div className="password-reset-resend">
              <button
                type="button"
                onClick={handleResendCode}
                className="password-reset-resend-button"
                disabled={isLoading}
              >
                Didn't receive the code? Resend
              </button>
            </div>

            <div className="password-reset-actions">
              <Button
                type="submit"
                variant="default"
                className="password-reset-submit"
                disabled={isLoading || !isLoaded || code.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </Button>
              <button
                type="button"
                onClick={() => {
                  setStep('email');
                  setCode('');
                  setErrorMessage('');
                }}
                className="password-reset-cancel"
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          </form>
        );

      case 'password':
        return (
          <form onSubmit={handlePasswordSubmit}>
            <p className="password-reset-description">
              Enter your new password below.
            </p>

            <div className="password-reset-form-group">
              <label htmlFor="new-password" className="password-reset-label">
                New Password
              </label>
              <div className="login-password-wrapper">
                <Input
                  id="new-password"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="password-reset-input login-password-input"
                  required
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-password-toggle"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              </div>
              <small className="password-reset-hint">
                Must be at least 8 characters long
              </small>
              <PasswordStrengthMeter 
                password={newPassword}
                email={email}
                onStrengthChange={setPasswordStrength}
              />
            </div>

            <div className="password-reset-form-group">
              <label htmlFor="confirm-password" className="password-reset-label">
                Confirm New Password
              </label>
              <div className="login-password-wrapper">
                <Input
                  id="confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="password-reset-input login-password-input"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="login-password-toggle"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-blue-500" />
                  ) : (
                    <Eye className="h-5 w-5 text-blue-500" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <div className="password-reset-error">
                {errorMessage}
              </div>
            )}

            <div className="password-reset-actions">
              <Button
                type="submit"
                variant="default"
                className="password-reset-submit"
                disabled={isLoading || !isLoaded || (newPassword.length >= 8 && passwordStrength < 4)}
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
              {newPassword.length >= 8 && passwordStrength < 4 && (
                <p className="text-sm text-red-600 mt-2 text-center">
                  ⚠️ Password must be strong (green indicator) to continue
                </p>
              )}
              <button
                type="button"
                onClick={() => {
                  setStep('code');
                  setNewPassword('');
                  setConfirmPassword('');
                  setErrorMessage('');
                }}
                className="password-reset-cancel"
                disabled={isLoading}
              >
                Back
              </button>
            </div>
          </form>
        );

      case 'success':
        return (
          <div className="password-reset-success">
            <div className="password-reset-success-icon">✓</div>
            <p className="password-reset-success-title">Password Reset Successfully!</p>
            <p className="password-reset-success-text">
              Your password has been changed. You're now logged in and will be redirected shortly.
            </p>
            <p className="password-reset-success-note">
              Redirecting to your account...
            </p>
          </div>
        );
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="password-reset-backdrop"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="password-reset-modal">
        <div className="password-reset-modal-content">
          {/* Header */}
          <div className="password-reset-header">
            <h2 className="password-reset-title">
              {step === 'email' && 'Reset Your Password'}
              {step === 'code' && 'Enter Verification Code'}
              {step === 'password' && 'Set New Password'}
              {step === 'success' && 'All Set!'}
            </h2>
            <button
              onClick={handleClose}
              className="password-reset-close"
              aria-label="Close modal"
              disabled={isLoading}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="password-reset-body">
            {renderStep()}
          </div>
        </div>
      </div>
    </>
  );
}

