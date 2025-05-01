'use client';

// --- React ---
import { useEffect } from 'react';
// --- Next ---
import { useRouter } from 'next/navigation';

// Define or import your redirects map
const redirects: Record<string, string> = { '/inventory-list': '/spools' };

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
