// src/app/products/spoolsense/page.tsx

// --- React ---
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Styles ---
import styles from '@/public/styles/components/products/ProductPage.module.css';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRuler,
  faCheckCircle,
  faShoppingCart,
  faBatteryFull,
  faMobileScreen,
} from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = generateMetadata({
  title: 'SpoolSense - Filament Tracking System for 3D Filament Tracker',
  description:
    'Eliminate costly 3D printing failures with SpoolSense. Accurate in-spool filament measurement tool with eInk display and FilaMeter filament tracking app integration for real-time filament tracking.',
  keywords: [
    'filament tracking',
    '3d filament tracker',
    'filament tracking app',
    'filament tracking system',
    'filament roll tracker',
    '3d printer filament tracking app',
    'filament inventory management',
    'spool tracker',
    'spoolsense',
    'filament measurement',
    '3d printing',
    'eink display',
    'filament management app',
  ],
});

export default function SpoolSensePage() {
  const shopUrl =
    'https://shop.silocitylabs.com/products/spoolsense-a-filament-meter-for-your-spools-preorder';

  const features = [
    {
      icon: faRuler,
      title: 'Precision Filament Tracking',
      description:
        'SpoolSense fits directly inside filament spools. The compact design adds no extra clutter and requires no additional setup.',
    },
    {
      icon: faMobileScreen,
      title: 'Built-in eInk Display',
      description:
        'The battery-powered 0.97" eInk screen provides instant feedback, showing exactly how much filament has been used on each spool.',
    },
    {
      icon: faCheckCircle,
      title: 'FilaMeter Integration',
      description:
        'Use SpoolSense with FilaMeter, a free open-source companion web tool for spool management and tracking. Easily monitor your available filament across multiple spools.',
    },
    {
      icon: faBatteryFull,
      title: 'Reusable & Replaceable',
      description:
        'Each SpoolSense can be uninstalled from empty spools and re-installed on new spools and features a user-replaceable CR2032 battery.',
    },
  ];

  const benefits = [
    'Accurate & Reliable – Know exactly how much filament has been used on every spool.',
    'Compact & Convenient – Installs directly into spools without adding bulk.',
    'Reduces Waste – Prevents unwinding issues by clipping filament and helps eliminate failed prints resulting from lack of filament.',
    'Smart Tracking with FilaMeter – Monitor multiple spools in one easy-to-use dashboard.',
  ];

  return (
    <PageLayout>
      <div className={styles.productPageSection}>
        <Container>
          {/* Hero Section */}
          <Row className='justify-content-center text-center mb-5'>
            <Col md={10} lg={8}>
              <div className={styles.heroIcon}>
                <FontAwesomeIcon icon={faRuler} size='4x' />
              </div>
              <h1 className='display-4 fw-bold mb-4'>SpoolSense</h1>
              <p className='lead text-muted mb-4'>Accurate In-Spool Filament Measurement</p>
              <p className={styles.heroDescription}>
                <strong>Eliminate Costly 3D Printing Failures</strong>
              </p>
              <p className={styles.heroDescription}>
                Never wonder if you have enough filament to complete a print again. SpoolSense is an
                in-spool filament measurement tool that gives 3D printing enthusiasts the power to
                accurately track filament usage in real-time. This advanced{' '}
                <strong>filament tracking system</strong> works seamlessly with the FilaMeter{' '}
                <strong>filament tracking app</strong> and <strong>3D filament tracker</strong>. By
                eliminating the guesswork inherent in estimating how much filament remains in a
                spool, SpoolSense helps prevent costly printing failures and unnecessary filament
                waste.
              </p>
              <Button
                variant='primary'
                size='lg'
                href={shopUrl}
                target='_blank'
                className={styles.buyNowButton}>
                <FontAwesomeIcon icon={faShoppingCart} className='me-2' />
                Pre-Order Now
              </Button>
            </Col>
          </Row>

          {/* Features Section */}
          <Row className='g-4 mb-5'>
            {features.map((feature, idx) => (
              <Col key={idx} md={6} lg={3}>
                <div className={styles.featureCard}>
                  <div className={styles.featureIcon}>
                    <FontAwesomeIcon icon={feature.icon} size='2x' />
                  </div>
                  <h3 className={styles.featureTitle}>{feature.title}</h3>
                  <p className={styles.featureDescription}>{feature.description}</p>
                </div>
              </Col>
            ))}
          </Row>

          {/* Benefits Section */}
          <Row className='mb-5'>
            <Col md={10} lg={8} className='mx-auto'>
              <div className={styles.benefitsSection}>
                <h2 className='h3 fw-bold mb-4 text-center'>Why Choose SpoolSense?</h2>
                <ul className={styles.benefitsList}>
                  {benefits.map((benefit, idx) => (
                    <li key={idx}>
                      <FontAwesomeIcon icon={faCheckCircle} className='me-2' />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>

          {/* Two Ways to Monitor */}
          <Row className='mb-5'>
            <Col md={10} lg={8} className='mx-auto'>
              <div className={styles.howItWorks}>
                <h2 className='h3 fw-bold mb-4 text-center'>Two Ways to Monitor Filament Usage</h2>
                <Row className='g-4'>
                  <Col md={6} className='text-center'>
                    <div className={styles.stepNumber}>1</div>
                    <h4 className='h5 fw-bold mt-3 mb-2'>Built-in eInk Display</h4>
                    <p>
                      The battery-powered 0.97&quot; eInk screen provides instant feedback, showing
                      exactly how much filament has been used on each spool.
                    </p>
                  </Col>
                  <Col md={6} className='text-center'>
                    <div className={styles.stepNumber}>2</div>
                    <h4 className='h5 fw-bold mt-3 mb-2'>FilaMeter Integration</h4>
                    <p>
                      Use SpoolSense with FilaMeter, a free open-source companion web tool for spool
                      management and tracking. Easily monitor your available filament across
                      multiple spools and prevent failed prints due to filament shortages.
                    </p>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Specifications */}
          <Row className='mb-5'>
            <Col md={10} lg={8} className='mx-auto'>
              <div className={styles.specsSection}>
                <h2 className='h3 fw-bold mb-4 text-center'>Specifications</h2>
                <Row className='g-4'>
                  <Col md={6}>
                    <div className={styles.specItem}>
                      <strong>Display:</strong> 0.97&quot; E-ink Display
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className={styles.specItem}>
                      <strong>Battery:</strong> CR2032 (not included)
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className={styles.specItem}>
                      <strong>Dimensions:</strong> (tbd) mm x (tbd) mm x (tbd) mm
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className={styles.specItem}>
                      <strong>Weight:</strong> (tbd) grams
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* CTA Section */}
          <Row className='justify-content-center'>
            <Col md={8} className='text-center'>
              <div className={styles.ctaSection}>
                <h2 className='h3 fw-bold mb-3'>Ready to Eliminate Filament Failures?</h2>
                <p className='lead mb-4'>
                  For 3D printing enthusiasts who demand precision and efficiency, SpoolSense is the
                  ultimate tool to maximize filament usage.
                </p>
                <Button
                  variant='primary'
                  size='lg'
                  href={shopUrl}
                  target='_blank'
                  className={styles.buyNowButton}>
                  <FontAwesomeIcon icon={faShoppingCart} className='me-2' />
                  Pre-Order Now
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
