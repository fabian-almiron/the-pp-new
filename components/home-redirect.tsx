"use client"

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function HomeRedirect() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/video-library');
    }
  }, [isLoaded, isSignedIn, router]);

  // This component doesn't render anything
  return null;
}
