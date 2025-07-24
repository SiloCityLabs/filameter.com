// --- React ---
import React from 'react';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Feedback',
  description:
    'Provide feedback, submit a bug report, or suggest a new feature for FilaMeter via our GitHub issues integration.',
  keywords: ['feedback', 'bug report', 'feature request', 'github issue', 'filameter', 'support'],
});

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <PageLayout>{children}</PageLayout>;
}
