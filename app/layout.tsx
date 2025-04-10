import { Suspense } from "react";
// --- Next ---
import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
// --- Components ---
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import GoogleAnalytics from "@/components/_silabs/GoogleAnalytics";
import { DatabaseProvider } from "@/contexts/DatabaseContext"; // Import DatabaseProvider
import ServiceWorkerRegistrar from "@/components/ServiceWorkerRegistrar";

// --- Styles ---
import "bootstrap/dist/css/bootstrap.min.css";
import "@/public/styles/_fw.css";
import "./globals.css";

// --- Environment Variables ---
const GA_TRACKING_ID = process.env.NEXT_PUBLIC_APP_GA_TRACKING_ID;
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "SiloCityPages";
const APP_DESC = process.env.NEXT_PUBLIC_APP_DESC || "Default description";
const APP_KEYWORDS =
  process.env.NEXT_PUBLIC_APP_KEYWORDS || "default, keywords";

// --- Metadata ---
// Define static metadata for the entire application
export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`, // Example: "About | SiloCityPages"
  },
  description: APP_DESC,
  keywords: APP_KEYWORDS?.split(",").map((k) => k.trim()),
  manifest: "/manifest.json",
};

// --- Viewport ---
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // themeColor: "#ffffff", // Optional: Add theme color
};

// Setup a font (example using Inter)
const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <DatabaseProvider>
          <div className="main-container">
            <Header showBadge={true} />
            <main className="main-content">
              {children} {/* Page content */}
            </main>
            <Footer />
          </div>
        </DatabaseProvider>

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
