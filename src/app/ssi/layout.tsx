// --- React ---
import React from 'react';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Processing Spool Import',
  description: 'Processing your Spool Sense Import data for FilaMeter.',
  keywords: ['spool sense import', 'ssi', 'filament import', '3d printing', 'filameter'],
});

export default function SsiLayout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>;
}
