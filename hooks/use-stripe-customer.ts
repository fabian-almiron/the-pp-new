import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

interface StripeCustomerLink {
  customerId: string | null;
  isLinked: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to automatically link Clerk user to Stripe customer
 * Checks if user already has a Stripe customer ID, and if not, creates or links one
 */
export function useStripeCustomer(): StripeCustomerLink {
  const { user, isLoaded } = useUser();
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [isLinked, setIsLinked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function linkStripeCustomer() {
      if (!isLoaded || !user) {
        setIsLoading(false);
        return;
      }

      // Check if already linked in metadata
      const existingCustomerId = user.privateMetadata?.stripeCustomerId as string | undefined;
      if (existingCustomerId) {
        setCustomerId(existingCustomerId);
        setIsLinked(true);
        setIsLoading(false);
        return;
      }

      // Attempt to link
      try {
        const response = await fetch('/api/link-stripe-customer', {
          method: 'POST',
        });

        if (!response.ok) {
          throw new Error('Failed to link Stripe customer');
        }

        const data = await response.json();
        setCustomerId(data.customerId);
        setIsLinked(true);
        
        // Reload user to get updated metadata
        await user.reload();
      } catch (err: any) {
        console.error('Error linking Stripe customer:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    linkStripeCustomer();
  }, [user, isLoaded]);

  return {
    customerId,
    isLinked,
    isLoading,
    error,
  };
}

