"use client"

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';

interface Subscription {
  id: number;
  documentId: string;
  name: string;
  description: string;
  subscriptionPrice: number;
  subscriptionLength: string;
  freeTrialDays: number;
  stripeProductId: string;
  stripePriceId: string;
  features: string[];
  active: boolean;
  slug: string;
  featured: boolean;
}

interface UserSubscription {
  id: number;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  subscription: Subscription;
}

interface SubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptions: UserSubscription[];
  userRole: string;
}

export function useSubscription() {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [availableSubscriptions, setAvailableSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isLoaded } = useUser();

  // Fetch available subscriptions
  useEffect(() => {
    const fetchAvailableSubscriptions = async () => {
      try {
        // Fetch from our API route which handles authentication
        const response = await fetch('/api/subscriptions-list');
        
        if (response.ok) {
          const { subscriptions } = await response.json();
          setAvailableSubscriptions(subscriptions || []);
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
      }
    };

    fetchAvailableSubscriptions();
  }, []);

  // Fetch user subscription status from Clerk metadata
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      if (!isLoaded || !user) {
        setLoading(false);
        return;
      }

      try {
        // Check Clerk public metadata for subscription status
        const clerkRole = user.publicMetadata?.role as string || 'Customer';
        const hasActiveSubscription = clerkRole === 'Subscriber';
        
        setSubscriptionStatus({
          hasActiveSubscription,
          subscriptions: [],
          userRole: clerkRole
        });
      } catch (err) {
        console.error('Error checking subscription status:', err);
        // Default to Customer role if error
        setSubscriptionStatus({
          hasActiveSubscription: false,
          subscriptions: [],
          userRole: 'Customer'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user, isLoaded]);

  const createSubscriptionCheckout = async (subscriptionDocumentId: string) => {
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }

    const response = await fetch('/api/subscription-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscriptionId: subscriptionDocumentId,
        userId: user.id,
        userEmail: user.emailAddresses[0]?.emailAddress,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create checkout session');
    }

    const { url } = await response.json();
    return url;
  };

  const refreshSubscriptionStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Force reload user data from Clerk to get latest metadata
      await user.reload();
      
      const clerkRole = user.publicMetadata?.role as string || 'Customer';
      const hasActiveSubscription = clerkRole === 'Subscriber';
      
      setSubscriptionStatus({
        hasActiveSubscription,
        subscriptions: [],
        userRole: clerkRole
      });
    } catch (err) {
      console.error('Error refreshing subscription status:', err);
    } finally {
      setLoading(false);
    }
  };

  const hasAccess = (requiredRole: 'Customer' | 'Subscriber' = 'Subscriber') => {
    if (!subscriptionStatus) return false;
    
    if (requiredRole === 'Customer') {
      return ['Customer', 'Subscriber'].includes(subscriptionStatus.userRole);
    }
    
    return subscriptionStatus.hasActiveSubscription && subscriptionStatus.userRole === 'Subscriber';
  };

  return {
    subscriptionStatus,
    availableSubscriptions,
    loading,
    error,
    createSubscriptionCheckout,
    refreshSubscriptionStatus,
    hasAccess,
    isSubscriber: subscriptionStatus?.hasActiveSubscription || false,
    userRole: subscriptionStatus?.userRole || 'Customer',
  };
}
