// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Manage Filament',
  description: 'Add, edit, or duplicate filament spool records.',
};

export default function ManageFilamentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLayout headerShowBadge={true}>{children}</PageLayout>
    </>
  );
}
