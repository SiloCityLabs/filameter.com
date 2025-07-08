// --- React ---
import React from 'react';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';

export default function HomePage() {
  return (
    <PageLayout headerShowBadge={true}>
      <Hero />
      <Features />
    </PageLayout>
  );
}
