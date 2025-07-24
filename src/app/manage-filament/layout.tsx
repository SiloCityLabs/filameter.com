// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Manage 3D Printer Filament Spools',
  description:
    'Effortlessly track, add, edit, and duplicate your 3D printer filament spools with Filameter. Organize your inventory, monitor usage, and optimize your 3D printing workflow.',
  keywords: [
    'filament management',
    '3D printer filament',
    'spool management',
    'filament inventory',
    'track filament',
    'filament usage',
    '3D printing workflow',
    'add filament',
    'edit filament',
    'duplicate filament',
    'filament tracker',
    '3D print supplies',
    'material management',
    'filament database',
    'filameter',
    '3D printing organization',
  ],
});

export default function ManageFilamentLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLayout headerShowBadge={true}>{children}</PageLayout>
    </>
  );
}
