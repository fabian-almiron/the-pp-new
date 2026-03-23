"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRole } from "@/hooks/use-role";

const STORAGE_KEY_PREFIX = "pipedPeonySubscriberPricingNoticeDismissed";
/** Hide the banner after this instant (local): April 23, 2026 00:00 */
const NOTICE_END = new Date(2026, 3, 23);

function isNoticePeriodActive(): boolean {
  return Date.now() < NOTICE_END.getTime();
}

function dismissStorageKey(userId: string) {
  return `${STORAGE_KEY_PREFIX}:${userId}`;
}

export function SubscriberPricingNotice() {
  const { user } = useUser();
  const { isSubscriber, isLoaded, isSignedIn } = useRole();
  const [dismissed, setDismissed] = useState(false);
  /** null = still checking Stripe; true = on legacy price; false = new price or ineligible */
  const [legacyEligible, setLegacyEligible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!user?.id) {
      return;
    }
    try {
      if (localStorage.getItem(dismissStorageKey(user.id)) === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }
  }, [user?.id]);

  useEffect(() => {
    if (
      !isLoaded ||
      !isSignedIn ||
      !isSubscriber ||
      !user?.id ||
      !isNoticePeriodActive()
    ) {
      setLegacyEligible(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/subscriber-legacy-pricing-notice-eligible");
        if (cancelled) return;
        if (!res.ok) {
          setLegacyEligible(false);
          return;
        }
        const data = (await res.json()) as { eligible?: boolean };
        setLegacyEligible(data.eligible === true);
      } catch {
        if (!cancelled) setLegacyEligible(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, isSubscriber, user?.id]);

  if (!isLoaded || !isSignedIn || !isSubscriber || !user?.id) {
    return null;
  }

  if (!isNoticePeriodActive() || dismissed) {
    return null;
  }

  if (legacyEligible !== true) {
    return null;
  }

  const handleDismiss = () => {
    try {
      localStorage.setItem(dismissStorageKey(user.id), "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  };

  return (
    <div
      role="region"
      aria-label="Membership pricing update"
      dir="ltr"
      className="relative z-40 border-b border-black/10 bg-[rgb(255_228_195)] px-4 py-8 pb-8 pr-12 text-black shadow-sm sm:px-6 sm:pr-14 lg:px-8 lg:pr-16"
    >
      <button
        type="button"
        onClick={handleDismiss}
        className="absolute right-3 top-3 rounded-md p-1.5 text-black/70 transition-colors hover:bg-black/5 hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black/40 sm:right-4 sm:top-4"
        aria-label="Dismiss pricing notice"
      >
        <X className="h-5 w-5" strokeWidth={2} aria-hidden />
      </button>
      <div className="mx-auto max-w-7xl text-center sm:text-left">
        <h2 className="font-serif text-lg font-semibold tracking-tight text-black sm:text-xl">
          Thank you for growing with us
        </h2>
        <p className="mt-0 text-sm mb-[5px] leading-relaxed text-black sm:text-[15px]">
          To support the continued growth of The Piped Peony Academy, membership pricing
          will increase from $15 to $20 per month starting April 22, 2026.
        </p>
        <p className="mt-0 mb-[5px] text-sm leading-relaxed text-black sm:text-[15px]">
          Your membership will update automatically on your first billing cycle after
          April 22, and your access to all content will remain unchanged.
        </p>
        <p className="mt-3 text-xs text-black/80">
          See our{" "}
          <Link
            href="/terms-subscription"
            className="font-medium text-black underline decoration-black/50 underline-offset-2 hover:decoration-black"
          >
            subscription terms
          </Link>{" "}
          for details.
        </p>
      </div>
    </div>
  );
}
