'use client';

// --- React ---
import React from 'react';
import { Container, Row, Col, Button, Image } from 'react-bootstrap';
// --- Styles ---
import styles from './Hero.module.css';

const Hero: React.FC = () => {
  return (
    <section className={styles.heroSection}>
      <Container>
        <Row className='justify-content-center text-center'>
          <Col md={10} lg={8}>
            <div className={styles.heroContent}>
              {/* Logo Area */}
              <Image
                src='/images/logos/filameter-logo.svg'
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
                <Button
                  variant='custom'
                  size='lg'
                  className={styles.ctaButton}
                  href='#features' // Link to your features section
                >
                  Get Started for Free
                </Button>
                <Button
                  variant='outline-custom'
                  size='lg'
                  className={styles.secondaryButton}
                  href='#contact' // Link to your contact section
                >
                  Learn More
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default Hero;
