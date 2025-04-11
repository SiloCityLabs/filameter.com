import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Manage Filament",
  description: "Add, edit, or duplicate filament spool records.",
};

export default function ManageFilamentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
