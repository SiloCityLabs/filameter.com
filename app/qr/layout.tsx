// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';

export const metadata: Metadata = {
  title: 'Spool Sense QR Scan',
  description: 'Processing QR code scan for Spool Sense filament.',
};

export default function QrLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageLayout headerShowBadge={true}>{children}</PageLayout>
    </>
  );
}
