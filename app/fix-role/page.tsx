"use client"

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";

export default function FixRolePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const fixRole = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/fix-subscription-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
        // Reload user data to get updated metadata
        if (user) {
          await user.reload();
        }
      } else {
        setError(data.error || 'Failed to fix role');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Fix Subscription Role
        </h1>
        
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Current Role in Clerk:</strong> {user?.publicMetadata?.role as string || 'Customer'}
          </p>
          <p className="text-sm text-blue-800 mt-2">
            This tool will check your Stripe subscription and update your Clerk role if needed.
          </p>
        </div>

        <Button
          onClick={fixRole}
          disabled={isLoading}
          className="w-full !bg-[#D4A771] !text-white hover:!bg-[#C69963]"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Checking Subscription...
            </>
          ) : (
            'Fix My Role'
          )}
        </Button>

        {result && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
            <div className="flex items-center mb-3">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <h3 className="text-lg font-semibold text-green-900">Success!</h3>
            </div>
            
            <div className="space-y-2 text-sm text-green-800">
              <p><strong>Previous Role:</strong> {result.previousRole}</p>
              <p><strong>New Role:</strong> {result.newRole}</p>
              
              {result.subscriptionDetails && (
                <>
                  <p><strong>Subscription Status:</strong> {result.subscriptionDetails.status}</p>
                  <p><strong>Current Period Ends:</strong> {new Date(result.subscriptionDetails.currentPeriodEnd).toLocaleDateString()}</p>
                  {result.subscriptionDetails.trialEnd && (
                    <p><strong>Trial Ends:</strong> {new Date(result.subscriptionDetails.trialEnd).toLocaleDateString()}</p>
                  )}
                </>
              )}
              
              {result.allSubscriptions && result.allSubscriptions.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer font-medium">All Subscriptions ({result.allSubscriptions.length})</summary>
                  <pre className="mt-2 text-xs bg-white p-3 rounded overflow-x-auto">
                    {JSON.stringify(result.allSubscriptions, null, 2)}
                  </pre>
                </details>
              )}
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800 font-medium">
                ✨ Your role has been updated! Please refresh the page to see the changes.
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded">
            <div className="flex items-center mb-2">
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              <h3 className="text-lg font-semibold text-red-900">Error</h3>
            </div>
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">Why do I need this?</h3>
          <p className="text-sm text-gray-600">
            Sometimes the Stripe webhook doesn't update your Clerk role immediately. 
            This tool manually checks your Stripe subscription and updates your Clerk metadata to match.
          </p>
        </div>
      </div>
    </div>
  );
}

