// src/app/pro/page.tsx

// --- React ---
import React from 'react';
import { Container } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import ProFeatures from '@/components/pro/ProFeatures';
// --- Styles ---
import styles from '@/public/styles/components/pro/ProFeatures.module.css';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Pro Features',
  description:
    'Discover FilaMeter Pro features including instant syncing and upcoming advanced tools for your 3D printing workflow.',
  keywords: ['pro', 'features', 'filameter', 'sync', '3d printing', 'inventory'],
});

export default function ProPage() {
  return (
    <PageLayout>
      <div className={styles.proSection}>
        <Container>
          <ProFeatures />
        </Container>
      </div>
    </PageLayout>
  );
}
