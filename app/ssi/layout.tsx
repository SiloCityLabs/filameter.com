// --- Next ---
import type { Metadata } from "next";
// --- Layout ---
import PageLayout from "@/components/PageLayout";

export const metadata: Metadata = {
  title: "Spool Sense Import",
  description: "Importing Spool Sense filament data.",
};

export default function SsiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLayout headerShowBadge={true}>{children}</PageLayout>
    </>
  );
}
