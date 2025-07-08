'use client';

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import styles from '@/public/styles/components/home/CtaSection.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode } from '@fortawesome/free-solid-svg-icons';

const CtaSection: React.FC = () => {
  const ctaLink =
    'https://shop.silocitylabs.com/discount/1GHIW2TI?redirect=%2Fproducts%2Ffilameter-labels%3Fvariant%3D50812497920300';

  return (
    <section className={styles.ctaSection}>
      <Container>
        <Row className='justify-content-center text-center'>
          <Col md={10} lg={8}>
            <div className={styles.ctaContent}>
              <FontAwesomeIcon icon={faQrcode} className={styles.ctaIcon} />
              <h2 className='display-5 fw-bold'>Get 5 Free QR Labels!</h2>
              <p className={`lead ${styles.ctaText}`}>
                Easily track and manage your filament spools with FilaMeter QR Labels. Scan, log,
                and monitor your filament usage with a simple tap. To help you get started,
                we&apos;re giving away 5 free labels—no strings attached!
              </p>
              <p className='text-white-50 mb-4'>Hurry—one use per customer while supplies last!</p>
              <Button
                variant='light'
                size='lg'
                href={ctaLink}
                target='_blank'
                className={styles.ctaButton}>
                Claim Your Free Labels
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CtaSection;
