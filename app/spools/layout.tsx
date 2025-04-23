// --- Next ---
import type { Metadata } from "next";
// --- Layout ---
import PageLayout from "@/components/PageLayout";

export const metadata: Metadata = {
  title: "Spools",
  description: "View and manage your filament spools.",
  keywords: ["filament", "spool", "manage", "3d printing"],
};

export default function SsiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLayout headerShowBadge={true}>{children}</PageLayout>
    </>
  );
}
