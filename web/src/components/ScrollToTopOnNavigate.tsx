"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "instant" : "smooth";
}

function scrollToTop() {
  window.scrollTo({ top: 0, left: 0, behavior: scrollBehavior() });
}

function scrollToHashTarget() {
  const hash = window.location.hash;
  if (hash.length <= 1) return;

  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return;

  el.scrollIntoView({ behavior: scrollBehavior(), block: "start" });
}

/**
 * Footer / in-app navigation scroll.
 * Page links use scroll={false} on Link so Next.js does not restore an old
 * scroll position; we smooth-scroll to top after the route has settled.
 * Hash links smooth-scroll to their section.
 */
export function ScrollToTopOnNavigate() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (window.location.hash.length > 1) scrollToHashTarget();
      return;
    }

    if (window.location.hash.length > 1) {
      requestAnimationFrame(() => scrollToHashTarget());
      return;
    }

    // Run after Next.js applies its scroll restoration (scroll={false} on links).
    const timer = window.setTimeout(() => scrollToTop(), 50);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  useEffect(() => {
    const onHashChange = () => scrollToHashTarget();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return null;
}
