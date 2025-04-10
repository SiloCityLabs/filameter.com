"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Define or import your redirects map
const redirects: Record<string, string> = {
  // Example: Key is the OLD path, Value is the NEW path
  "/old": "/new",
};

export default function NotFoundRedirector() {
  const router = useRouter();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const newPath = redirects[currentPath];

    if (newPath) {
      if (window.location.pathname !== newPath) {
        router.replace(newPath);
      }
    }
  }, [router]);

  return null;
}
