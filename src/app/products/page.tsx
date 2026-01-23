// src/app/products/page.tsx

// --- React ---
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
import Link from 'next/link';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import ProductImage from '@/components/products/ProductImage';
// --- Styles ---
import styles from '@/public/styles/components/products/ProductsOverview.module.css';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Products - FilaMeter | Filament Tracking App & 3D Filament Tracker',
  description:
    'Discover FilaMeter products for filament tracking, including QR code labels, Pro features, and SpoolSense. The ultimate 3D filament tracker and filament tracking app for efficient filament inventory management.',
  keywords: [
    'filament tracking',
    '3d filament tracker',
    'filament tracking app',
    'filament management app',
    'filament tracking labels',
    'filament roll tracker',
    'filament tracking system',
    '3d printer filament tracking app',
    'filament inventory management',
    '3d printing filament manager',
    '3d printing inventory',
    'filament management',
    'filament tracking spreadsheet',
    'spool tracker',
    'filament inventory management',
    'products',
    'filament labels',
    'pro',
    'spoolsense',
    '3d printing',
    'inventory',
  ],
});

export default function ProductsPage() {
  const products = [
    {
      id: 'labels',
      title: 'FilaMeter Labels',
      description:
        'Filament tracking labels that simplify filament spool management. Essential for any filament tracking app or 3D filament tracker. Scan to instantly add or update spools in your FilaMeter inventory.',
      image: '/images/misc/filament-labels.webp',
      link: '/products/labels',
      features: ['Instant Spool Registration', 'Easy Usage Updates', 'Unique QR Codes'],
    },
    {
      id: 'pro',
      title: 'FilaMeter Pro',
      description:
        'Unlock advanced features in the premium filament tracking app. Get zero-cooldown syncing and seamless data synchronization across all your devices for the ultimate 3D filament tracker experience.',
      image: '/images/logos/filameter-logo.svg',
      link: '/products/pro',
      features: ['Zero-Cooldown Syncing', 'Cross-Device Sync', 'Lifetime Access'],
    },
    {
      id: 'spoolsense',
      title: 'SpoolSense',
      description:
        'Accurate in-spool filament measurement tool with eInk display. Integrates with FilaMeter filament tracking app for comprehensive filament tracking system capabilities.',
      image: '/images/logos/filameter-logo.svg',
      link: '/products/spoolsense',
      features: ['eInk Display', 'FilaMeter Integration', 'Real-Time Tracking'],
    },
  ];

  return (
    <PageLayout>
      <div className={styles.productsSection}>
        <Container>
          <Row className='justify-content-center text-center mb-5'>
            <Col md={10} lg={8}>
              <h1 className='display-4 fw-bold mb-4'>FilaMeter Products</h1>
              <p className='lead text-muted'>
                FilaMeter is the leading <strong>filament tracking app</strong> and{' '}
                <strong>3D filament tracker</strong> designed to simplify and optimize your 3D
                printing filament management. From QR code labels for instant{' '}
                <strong>filament tracking</strong> to advanced Pro features and hardware solutions,
                our products work together to help you manage your filament inventory efficiently
                and cost-effectively.
              </p>
            </Col>
          </Row>

          <Row className='g-4 mb-5'>
            {products.map((product) => (
              <Col key={product.id} md={6} lg={4}>
                <Link href={product.link} className={styles.productCard}>
                  <div className={styles.cardContent}>
                    <div className={styles.imageWrapper}>
                      <ProductImage
                        src={product.image}
                        alt={product.title}
                        className={styles.productImage}
                      />
                    </div>
                    <h3 className={styles.productTitle}>{product.title}</h3>
                    <p className={styles.productDescription}>{product.description}</p>
                    <ul className={styles.featuresList}>
                      {product.features.map((feature, idx) => (
                        <li key={idx}>{feature}</li>
                      ))}
                    </ul>
                    <div className={styles.learnMore}>Learn More →</div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
