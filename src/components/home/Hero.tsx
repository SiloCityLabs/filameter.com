'use client';

// --- React ---
import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
// --- Next ---
import Link from 'next/link';
// --- Styles ---
import styles from '@/public/styles/components/home/Hero.module.css';

const Hero: React.FC = () => {
  return (
    <section className={styles.heroSection}>
      <Container>
        <Row className='justify-content-center text-center'>
          <Col md={10} lg={8}>
            <div className={`${styles.heroContent} mt-3`}>
              {/* Logo Area */}
              <Image
                src='/images/logos/filameter-banner-slim-blue.webp'
                alt='FilaMeter Logo'
                className={styles.logo}
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = 'https://placehold.co/150x150/117ace/ffffff?text=FilaMeter';
                  e.currentTarget.onerror = null;
                }}
              />

              {/* Animated Headline */}
              <h1 className={`${styles.headline} display-3`}>
                FilaMeter: Your Open Source Filament Inventory Manager
              </h1>

              {/* Animated Subheading */}
              <p className={`${styles.subheading} lead`}>
                Track, manage, and optimize your filament usage — locally and efficiently. Sync your
                data across all your devices.
              </p>

              {/* Call-to-Action Buttons */}
              <div className={styles.ctaContainer}>
                <Link href='/spools'>
                  <Button variant='custom' size='lg' className={styles.ctaButton}>
                    Get Started for Free
                  </Button>
                </Link>
                <Link href='/faq'>
                  <Button variant='outline-custom' size='lg' className={styles.secondaryButton}>
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
