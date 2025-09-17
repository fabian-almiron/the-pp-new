"use client";

import { useEffect } from "react";

interface ScrollToHashProps {
  behavior?: ScrollBehavior;
  offset?: number;
}

export function ScrollToHash({ behavior = "smooth", offset = 0 }: ScrollToHashProps) {
  useEffect(() => {
    const scrollToHash = () => {
      if (typeof window === "undefined") return;
      const { hash } = window.location;
      if (!hash) return;

      const elementId = hash.startsWith("#") ? hash.slice(1) : hash;
      const target = document.getElementById(elementId);
      if (!target) return;

      const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior });
    };

    const onInitialLoad = () => {
      if (typeof window === "undefined") return;
      const { hash } = window.location;
      if (!hash) return;
      // Jump to top instantly, then smooth scroll to the hash
      window.scrollTo({ top: 0, behavior: "auto" });
      setTimeout(scrollToHash, 100);
    };

    const raf = requestAnimationFrame(onInitialLoad);
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, [behavior, offset]);

  return null;
}


