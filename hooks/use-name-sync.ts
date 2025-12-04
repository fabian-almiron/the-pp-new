import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';

/**
 * Hook to automatically sync user name from Stripe
 * Always overwrites existing name with Stripe data
 * Runs once when user data is loaded
 */
export function useNameSync() {
  const { user, isLoaded } = useUser();
  const [isSyncing, setIsSyncing] = useState(false);
  const [hasSynced, setHasSynced] = useState(false);

  useEffect(() => {
    async function syncName() {
      // Only run if:
      // 1. User data is loaded
      // 2. User exists
      // 3. Haven't already attempted sync in this session
      if (!isLoaded || !user || hasSynced || isSyncing) {
        return;
      }

      console.log('🔄 Attempting to sync name from Stripe...');
      setIsSyncing(true);

      try {
        const response = await fetch('/api/sync-name-from-stripe', {
          method: 'POST',
        });

        if (response.ok) {
          const data = await response.json();
          console.log('✅ Name synced from Stripe:', data);
          
          // Reload user data to get updated name
          await user.reload();
          setHasSynced(true);
        } else {
          const error = await response.json();
          console.log('ℹ️ Could not sync name from Stripe:', error.error);
          setHasSynced(true); // Mark as attempted even if failed
        }
      } catch (error) {
        console.error('❌ Error syncing name:', error);
        setHasSynced(true); // Mark as attempted even if failed
      } finally {
        setIsSyncing(false);
      }
    }

    syncName();
  }, [user, isLoaded, hasSynced, isSyncing]);

  return { isSyncing, hasSynced };
}

