// src/components/pro/ProFeatures.tsx
'use client';

// --- React ---
import React from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
// --- Next ---
import Link from 'next/link';
// --- Styles ---
import styles from '@/public/styles/components/pro/ProFeatures.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBolt,
  faRocket,
  faShoppingCart,
  faSync,
  faQrcode,
} from '@fortawesome/free-solid-svg-icons';

const ProFeatures: React.FC = () => {
  const shopUrl = 'https://shop.silocitylabs.com/cart/50812497920300:4,50948651843884:1';

  return (
    <>
      <Row className='justify-content-center text-center mb-5'>
        <Col md={8}>
          <h1 className='display-4 fw-bold mb-3'>FilaMeter Pro</h1>
          <p className='lead text-muted mb-4'>
            Unlock the full potential of your filament inventory with advanced features designed for
            power users.
          </p>
          <p className={styles.proDescription}>
            Grants <strong>lifetime access to an SCL Sync token</strong> for use across SiloCityLabs
            platforms. At launch, SCL Sync supports <strong>FilaMeter PRO (filameter.com)</strong>,
            with additional SCL sites planned in the future.
          </p>
          <p className={styles.proDescription}>
            SCL Sync enables secure syncing of your FilaMeter data across multiple devices, so your
            filament inventory stays consistent wherever you access it.
          </p>
          <Button
            variant='primary'
            size='lg'
            href={shopUrl}
            target='_blank'
            rel='noopener noreferrer'
            className={styles.buyNowButton}>
            <FontAwesomeIcon icon={faShoppingCart} className='me-2' />
            Buy Now - Lifetime Access
          </Button>
        </Col>
      </Row>

      <Row className='justify-content-center g-4 mb-5'>
        {/* Active Feature: Zero-Cooldown Syncing */}
        <Col md={6} lg={4}>
          <Card className={styles.proCard}>
            <Card.Body>
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faBolt} size='3x' />
              </div>
              <Card.Title as='h3' className='fw-bold mt-2 mb-3'>
                Zero-Cooldown Syncing
              </Card.Title>
              <Card.Text className={styles.cardText}>
                Eliminate the 60-second cooldown on manual syncing. Pro users can trigger updates
                immediately from the Spools or Settings page as often as needed, ensuring your data
                is always ready when you are.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* Cross-Device Sync */}
        <Col md={6} lg={4}>
          <Card className={styles.proCard}>
            <Card.Body>
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faSync} size='3x' />
              </div>
              <Card.Title as='h3' className='fw-bold mt-2 mb-3'>
                Cross-Device Sync
              </Card.Title>
              <Card.Text className={styles.cardText}>
                Sync your FilaMeter data securely across all your devices. Your filament inventory
                stays consistent whether you&apos;re on your desktop, tablet, or mobile device.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>

        {/* 20 Free Labels */}
        <Col md={6} lg={4}>
          <Card className={styles.proCard}>
            <Card.Body>
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faQrcode} size='3x' />
              </div>
              <Card.Title as='h3' className='fw-bold mt-2 mb-3'>
                20 Free FilaMeter Labels
              </Card.Title>
              <Card.Text className={styles.cardText}>
                Each Sync Key purchase includes <strong>20 free FilaMeter QR code labels</strong> to
                help you get started. Scan, log, and monitor your filament usage with ease.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className='justify-content-center g-4'>
        {/* Coming Soon Placeholder */}
        <Col md={6} lg={5}>
          <Card className={`${styles.proCard} ${styles.comingSoonCard}`}>
            <Card.Body>
              <div className={styles.iconWrapper}>
                <FontAwesomeIcon icon={faRocket} size='3x' />
              </div>
              <Card.Title as='h3' className='fw-bold mt-2 mb-3'>
                More Coming Soon
              </Card.Title>
              <Card.Text className={styles.cardText}>
                We are actively developing new tools to help you manage your print farm. Stay tuned
                for advanced reporting, team collaboration features, and more.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Additional Info */}
      <Row className='justify-content-center mt-5'>
        <Col md={8} className='text-center'>
          <div className={styles.additionalInfo}>
            <p className='text-muted mb-2'>
              <strong>Important:</strong> You <strong>must use the same email address</strong>{' '}
              associated with your existing sync keys when purchasing. The sync key is tied to that
              email. You must have a sync key before purchasing.{' '}
              <Link href='/settings?tab=sync' className='text-decoration-none fw-bold'>
                Create one in Settings
              </Link>
              .
            </p>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default ProFeatures;
