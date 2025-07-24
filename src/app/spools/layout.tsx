// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Spools',
  description:
    'View, search, and manage all of your 3D printing filament spools in one place. Keep track of weight, material, location, and more.',
  keywords: [
    'filament',
    'spool',
    'inventory',
    'manage',
    '3d printing',
    'pla',
    'abs',
    'petg',
    'filament tracker',
  ],
});

export default function SsiLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLayout headerShowBadge={true}>{children}</PageLayout>
    </>
  );
}
