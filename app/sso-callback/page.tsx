"use client"

import { AuthenticateWithRedirectCallback } from '@clerk/nextjs';
import { PeonyLoader } from '@/components/ui/peony-loader';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
      <div className="text-center">
        <PeonyLoader />
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}

