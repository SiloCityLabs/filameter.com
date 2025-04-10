import type { Metadata } from "next";

// Define metadata specific to the /ssi route segment
export const metadata: Metadata = {
  title: "Spool Sense Import",
  description: "Importing Spool Sense filament data.",
};

export default function SsiLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
