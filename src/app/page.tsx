// --- React ---
import React from 'react';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Sync from '@/components/home/Sync';
import OpenSourceSection from '@/components/home/OpenSourceSection';
import ContactSection from '@/components/home/ContactSection';
import CtaSection from '@/components/home/CtaSection';

export default function HomePage() {
  return (
    <PageLayout headerShowBadge={true}>
      <Hero />
      <CtaSection />
      <Features />
      <WhyChooseUs />
      <Sync />
      <OpenSourceSection />
      <ContactSection />
    </PageLayout>
  );
}
