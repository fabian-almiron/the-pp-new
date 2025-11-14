"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface SmartSignupButtonProps {
  variant?: "cta" | "light";
  className?: string;
  children: React.ReactNode;
}

export function SmartSignupButton({ variant = "cta", className, children }: SmartSignupButtonProps) {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  const handleClick = () => {
    if (isSignedIn) {
      router.push('/video-library');
    } else {
      router.push('/signup');
    }
  };

  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={handleClick}
      disabled={!isLoaded}
    >
      {children}
    </Button>
  );
}
