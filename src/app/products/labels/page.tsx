// src/app/products/labels/page.tsx

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
import { faQrcode, faCheckCircle, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

export const metadata: Metadata = generateMetadata({
  title: 'FilaMeter Labels - Filament Tracking Labels for 3D Filament Tracker',
  description:
    'Simplify your filament tracking with FilaMeter QR code labels. The perfect filament tracking labels for your filament tracking app. Instantly add and update spools with a single scan. Available in packs of 5 or 200 labels.',
  keywords: [
    'filament tracking',
    '3d filament tracker',
    'filament tracking app',
    'filament tracking labels',
    'filament roll tracker',
    'filament tracking system',
    '3d printer filament tracking app',
    'filament inventory management',
    'filament management app',
    'spool tracker',
    'filament labels',
    'qr code',
    '3d printing',
    'spool management',
    'filament tracking spreadsheet',
  ],
});

export default function LabelsPage() {
  const shopUrl = 'https://shop.silocitylabs.com/products/filameter-labels';

  const features = [
    {
      icon: faQrcode,
      title: 'Instant Spool Registration',
      description: 'Quickly add new spools to FilaMeter with a single scan.',
    },
    {
      icon: faCheckCircle,
      title: 'Easy Usage Updates',
      description:
        'No searching for the right spool to update, just scan and open the right entry in FilaMeter in seconds.',
    },
    {
      icon: faQrcode,
      title: 'Unique QR Codes',
      description:
        'Every label is generated with a distinct QR code to ensure accurate spool tracking.',
    },
    {
      icon: faCheckCircle,
      title: 'Seamless Integration',
      description: 'Designed to work effortlessly with the FilaMeter platform.',
    },
  ];

  const pricing = [
    { quantity: '1', discount: '—', totalPrice: '$2.99', pricePerLabel: '$0.60' },
    { quantity: '4+', discount: '17% OFF', totalPrice: '$10.20', pricePerLabel: '$0.51' },
    { quantity: '20+', discount: '75% OFF', totalPrice: '$15.00', pricePerLabel: '$0.15' },
    { quantity: '40+', discount: '85% OFF', totalPrice: '$18.00', pricePerLabel: '$0.09' },
  ];

  return (
    <PageLayout>
      <div className={styles.productPageSection}>
        <Container>
          {/* Hero Section */}
          <Row className='justify-content-center text-center mb-5'>
            <Col md={10} lg={8}>
              <div className={styles.heroIcon}>
                <FontAwesomeIcon icon={faQrcode} size='4x' />
              </div>
              <h1 className='display-4 fw-bold mb-4'>FilaMeter Labels</h1>
              <p className='lead text-muted mb-4'>
                Filament Tracking Labels for Your 3D Filament Tracker
              </p>
              <p className={styles.heroDescription}>
                Managing your 3D printing filament spools has never been easier with{' '}
                <strong>FilaMeter Labels</strong>. These specially designed QR code{' '}
                <strong>filament tracking labels</strong> provide a seamless way to track and update
                your spools within <strong>FilaMeter</strong>, the leading{' '}
                <strong>filament tracking app</strong> and <strong>3D filament tracker</strong> for
                comprehensive filament inventory management.
              </p>
              <Button
                variant='primary'
                size='lg'
                href={shopUrl}
                target='_blank'
                className={styles.buyNowButton}>
                <FontAwesomeIcon icon={faShoppingCart} className='me-2' />
                Buy Now
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

          {/* How It Works */}
          <Row className='mb-5'>
            <Col md={10} lg={8} className='mx-auto'>
              <div className={styles.howItWorks}>
                <h2 className='h3 fw-bold mb-4 text-center'>How It Works</h2>
                <Row className='g-4'>
                  <Col md={4} className='text-center'>
                    <div className={styles.stepNumber}>1</div>
                    <h4 className='h5 fw-bold mt-3 mb-2'>Scan to Add</h4>
                    <p>
                      By simply scanning a label, you can instantly add a spool to your FilaMeter
                      inventory, eliminating the need for manual entry.
                    </p>
                  </Col>
                  <Col md={4} className='text-center'>
                    <div className={styles.stepNumber}>2</div>
                    <h4 className='h5 fw-bold mt-3 mb-2'>Track Usage</h4>
                    <p>
                      When it&apos;s time to update spool usage, a quick scan ensures you&apos;re
                      modifying the correct spool. Our <strong>filament tracking system</strong>{' '}
                      saves time and reduces errors.
                    </p>
                  </Col>
                  <Col md={4} className='text-center'>
                    <div className={styles.stepNumber}>3</div>
                    <h4 className='h5 fw-bold mt-3 mb-2'>Stay Organized</h4>
                    <p>
                      With FilaMeter Labels, tracking your filament usage is faster, easier, and
                      more efficient.
                    </p>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>

          {/* Pricing Section */}
          <Row className='mb-5'>
            <Col md={10} lg={8} className='mx-auto'>
              <div className={styles.pricingSection}>
                <h2 className='h3 fw-bold mb-4 text-center'>Bulk Pricing (5-Pack only)</h2>
                <p className='text-center text-muted mb-4'>Price shown in cart.</p>
                <div className={styles.pricingTable}>
                  <table className='table'>
                    <thead>
                      <tr>
                        <th>Quantity</th>
                        <th>Discount</th>
                        <th>Total Price</th>
                        <th>Price per Label</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricing.map((row, idx) => (
                        <tr key={idx}>
                          <td>{row.quantity}</td>
                          <td>{row.discount}</td>
                          <td>{row.totalPrice}</td>
                          <td>{row.pricePerLabel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Col>
          </Row>

          {/* CTA Section */}
          <Row className='justify-content-center'>
            <Col md={8} className='text-center'>
              <div className={styles.ctaSection}>
                <h2 className='h3 fw-bold mb-3'>Ready to Simplify Your Filament Tracking?</h2>
                <p className='lead mb-4'>
                  Get started with FilaMeter Labels today and experience the easiest way to track
                  your filament inventory. The perfect addition to your{' '}
                  <strong>filament tracking app</strong> and <strong>3D filament tracker</strong>{' '}
                  workflow.
                </p>
                <Button
                  variant='primary'
                  size='lg'
                  href={shopUrl}
                  target='_blank'
                  className={styles.buyNowButton}>
                  <FontAwesomeIcon icon={faShoppingCart} className='me-2' />
                  Buy Now on Shop
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
