"use client"

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";

interface PasswordResetNotificationProps {
  open: boolean;
  onClose: () => void;
  userEmail: string;
}

export function PasswordResetNotification({
  open,
  onClose,
  userEmail,
}: PasswordResetNotificationProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleResetPassword = async () => {
    setIsResetting(true);
    try {
      // Trigger Clerk's password reset flow
      // This would typically redirect to Clerk's reset password page
      window.location.href = `/reset-password?email=${encodeURIComponent(userEmail)}`;
    } catch (error) {
      console.error('Error initiating password reset:', error);
      setIsResetting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-md"
        style={{
          backgroundColor: '#FBF9F6',
          borderRadius: '8px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-[#D4A771] rounded-full flex items-center justify-center">
              <ShieldAlert className="h-6 w-6 text-white" />
            </div>
          </div>
          <DialogTitle 
            className="text-center text-2xl font-serif"
            style={{ fontFamily: 'var(--font-playfair-display), serif' }}
          >
            Security Upgrade Required
          </DialogTitle>
          <DialogDescription 
            className="text-center pt-2"
            style={{ fontFamily: 'sofia-pro, sans-serif' }}
          >
            We've upgraded our site security! 🔒
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 px-2">
          <p 
            className="text-gray-700 text-sm leading-relaxed mb-4"
            style={{ fontFamily: 'sofia-pro, sans-serif' }}
          >
            To keep your account safe, you'll need to reset your password. This is a one-time 
            process due to security improvements we've made to protect your information.
          </p>
          <p 
            className="text-gray-600 text-xs"
            style={{ fontFamily: 'sofia-pro, sans-serif' }}
          >
            Don't worry – this will only take a moment, and you'll be back to creating beautiful 
            buttercream designs in no time! 🌸
          </p>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
            style={{
              fontFamily: 'sofia-pro, sans-serif',
              borderColor: '#ddd',
            }}
          >
            I'll Do This Later
          </Button>
          <Button
            onClick={handleResetPassword}
            disabled={isResetting}
            className="w-full sm:w-auto"
            style={{
              fontFamily: 'sofia-pro, sans-serif',
              backgroundColor: '#D4A771',
              color: 'white',
              border: 'none',
            }}
          >
            {isResetting ? 'Redirecting...' : 'Reset Password Now'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

