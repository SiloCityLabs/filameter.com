'use client';

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from '@/public/styles/components/home/CtaSection.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';

const CtaSection: React.FC = () => {
  const ctaLink = 'https://shop.silocitylabs.com/products/scl-sync-key';

  return (
    <section className={styles.ctaSection}>
      <Container>
        <Row className='justify-content-center text-center'>
          <Col md={10} lg={8}>
            <div className={styles.ctaContent}>
              <FontAwesomeIcon icon={faQrcode} className={styles.ctaIcon} />
              <h2 className='display-5 fw-bold'>Go Pro & Get 20 Labels on Us</h2>
              <p className={`lead ${styles.ctaText}`}>
                Ready to take your filament tracking to the next level? Upgrade to Pro today and
                we'll send you a pack of 20 QR labels for free. It's the perfect way to get your
                entire collection organized and logged instantly.
              </p>
              <p className='text-white-50 mb-4'>
                Grab your sync key to unlock Pro features and claim your labels.
              </p>
              <Button
                variant='light'
                size='lg'
                href={ctaLink}
                target='_blank'
                className={styles.ctaButton}>
                Get Pro & Free Labels
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CtaSection;
