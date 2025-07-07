// --- React ---
import React from 'react';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import Hero from '@/components/home/Hero';

export default function HomePage() {
  return (
    <PageLayout headerShowBadge={true}>
      <Hero />
    </PageLayout>
  );
}
