// --- React ---
import React from 'react';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Sync from '@/components/home/Sync';

export default function HomePage() {
  return (
    <PageLayout headerShowBadge={true}>
      <Hero />
      <Features />
      <WhyChooseUs />
      <Sync />
    </PageLayout>
  );
}
