"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Loader2 } from "lucide-react";
import { useSubscription } from "@/hooks/use-subscription";
import { sanitizeHTML } from "@/lib/sanitize";

interface SubscriptionPlansProps {
  onSubscriptionSelect?: (subscriptionDocumentId: string) => void;
  showTitle?: boolean;
}

export default function SubscriptionPlans({ onSubscriptionSelect, showTitle = true }: SubscriptionPlansProps) {
  const { availableSubscriptions, createSubscriptionCheckout } = useSubscription();
  const [loadingSubscription, setLoadingSubscription] = useState<string | null>(null);

  const handleSubscribe = async (subscriptionDocumentId: string) => {
    if (onSubscriptionSelect) {
      onSubscriptionSelect(subscriptionDocumentId);
      return;
    }

    setLoadingSubscription(subscriptionDocumentId);
    try {
      const checkoutUrl = await createSubscriptionCheckout(subscriptionDocumentId);
      window.location.href = checkoutUrl;
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start subscription process. Please try again.');
    } finally {
      setLoadingSubscription(null);
    }
  };

  if (availableSubscriptions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No subscription plans available at this time.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Choose Your Plan
          </h2>
          <p className="text-gray-600">
            Unlock premium content and exclusive courses
          </p>
        </div>
      )}

      <div className="flex justify-center">
        <div className="max-w-sm w-full">
          {availableSubscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="relative rounded-lg border border-gray-300 bg-white p-8 shadow-sm hover:shadow-md transition-all"
            >
              {subscription.freeTrialDays > 0 && (
                <div className="inline-block bg-green-100 text-green-800 text-xs font-medium px-3 py-1 rounded-full mb-6">
                  {subscription.freeTrialDays} days free trial
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                  {subscription.name}
                </h3>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">
                    ${subscription.subscriptionPrice}
                  </span>
                  <span className="text-gray-600 text-lg ml-1">
                    /{subscription.subscriptionLength.toLowerCase()}
                  </span>
                </div>

                <div 
                  className="text-gray-700 text-sm leading-relaxed mb-8 min-h-[200px]"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(subscription.description) }}
                />

                <Button
                  onClick={() => handleSubscribe(subscription.documentId)}
                  disabled={loadingSubscription === subscription.documentId}
                  className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 text-base"
                >
                  {loadingSubscription === subscription.documentId ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {subscription.freeTrialDays > 0 ? 'Start Free Trial' : 'Start Free Trial'}
                    </>
                  )}
                </Button>
              </div>

              {subscription.features && subscription.features.length > 0 && (
                <div className="pt-6 border-t border-gray-200">
                  <p className="text-center text-sm text-gray-600 mb-4">
                    All plans include access to premium courses, exclusive content, and community features. Cancel anytime.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
