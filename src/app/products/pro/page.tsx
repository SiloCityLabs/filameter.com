// src/app/products/pro/page.tsx

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
  title: 'FilaMeter Pro - Advanced Filament Tracking App Features',
  description:
    'Unlock advanced features in FilaMeter Pro, the premium 3D filament tracker. Get instant syncing, cross-device access, and advanced filament tracking capabilities for your 3D printing workflow.',
  keywords: [
    'filament tracking',
    '3d filament tracker',
    'filament tracking app',
    'filament management app',
    'filament tracking system',
    '3d printer filament tracking app',
    'filament inventory management',
    'pro',
    'features',
    'filameter',
    'sync',
    '3d printing',
    'inventory',
    'spool tracker',
  ],
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
