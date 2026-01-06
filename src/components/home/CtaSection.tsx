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
              <h2 className='display-5 fw-bold'>Upgrade to Pro — Get 20 Free QR Labels</h2>
              <p className={`lead ${styles.ctaText}`}>
                Upgrade to Pro and easily track and manage your filament spools with FilaMeter QR
                Labels. Scan, log, and monitor usage with a simple tap. To help you get started,
                we&apos;ll include 20 QR labels free with your Pro upgrade.
              </p>
              <Button
                variant='light'
                size='lg'
                href={ctaLink}
                target='_blank'
                className={styles.ctaButton}>
                Get Pro
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default CtaSection;
