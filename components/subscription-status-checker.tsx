"use client"

import { useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useSubscription } from '@/hooks/use-subscription';

interface SubscriptionStatusCheckerProps {
  children: React.ReactNode;
}

export default function SubscriptionStatusChecker({ children }: SubscriptionStatusCheckerProps) {
  const { user } = useUser();
  const { subscriptionStatus, refreshSubscriptionStatus } = useSubscription();

  useEffect(() => {
    if (!user || !subscriptionStatus) return;

    // Check subscription status every 5 minutes
    const interval = setInterval(() => {
      refreshSubscriptionStatus();
    }, 5 * 60 * 1000);

    // Check if any subscriptions are expiring soon (within 3 days)
    const checkExpiringSubscriptions = () => {
      if (subscriptionStatus.subscriptions.length === 0) return;

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

      subscriptionStatus.subscriptions.forEach(sub => {
        const periodEnd = new Date(sub.currentPeriodEnd);
        
        if (periodEnd <= threeDaysFromNow && sub.status === 'active' && !sub.cancelAtPeriodEnd) {
          // Subscription is expiring soon - could show a notification
          console.log(`Subscription ${sub.subscription?.name} expires on ${periodEnd.toLocaleDateString()}`);
        }
      });
    };

    checkExpiringSubscriptions();

    return () => clearInterval(interval);
  }, [user, subscriptionStatus, refreshSubscriptionStatus]);

  return <>{children}</>;
}
