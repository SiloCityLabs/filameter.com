import { Suspense } from 'react';
// --- Next ---
import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
// --- Components ---
import { GoogleAnalytics } from '@silocitypages/ui-core';
import ClientDatabaseProviderWrapper from '@/components/ClientDatabaseProviderWrapper';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

// --- Styles ---
import 'bootstrap/dist/css/bootstrap.min.css';
import '@/public/styles/_fw.css';
import './globals.css';

// --- Environment Variables ---
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_APP_GA_TRACKING_ID;

// --- Metadata ---
export const metadata: Metadata = generateMetadata();

// --- Viewport ---
export const viewport: Viewport = { width: 'device-width', initialScale: 1, userScalable: true };

// Setup a font
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <ClientDatabaseProviderWrapper>{children}</ClientDatabaseProviderWrapper>

        {GA_TRACKING_ID && (
          <Suspense fallback={null}>
            <GoogleAnalytics gaId={GA_TRACKING_ID} />
          </Suspense>
        )}

        <ServiceWorkerRegistrar />
      </body>
    </html>
  );
}
