'use client';

// --- React ---
import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';

// --- Next ---
import Image from 'next/image';

// --- Styles ---
import styles from '@/public/styles/components/Footer.module.css';

export default function Footer({ className }: { className?: string }) {
  const showLicense =
    process.env.NEXT_PUBLIC_FOOTER_SITE && process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT_URL;

  const images = [
    { src: 'https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1', alt: 'CC' },
    { src: 'https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1', alt: 'BY' },
    { src: 'https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1', alt: 'NC' },
    { src: 'https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1', alt: 'SA' },
  ];

  return (
    <footer id='site-footer' className={`${styles.footer} ${className}`}>
      <Container>
        <Row className='align-items-center text-center text-md-start'>
          {/* Column 1: Copyright and Logo */}
          <Col md={4} className='mb-3 mb-md-0'>
            <Image
              src='/images/logos/filameter-banner-slim-blue.webp'
              alt='FilaMeter Logo'
              width={120}
              height={40}
              className={styles.footerLogo}
            />
            {process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT && (
              <p className={styles.copyright}>
                <a href='https://silocitylabs.com' style={{ textDecoration: 'none' }}>
                  ©{new Date().getFullYear()} {process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT}
                </a>
              </p>
            )}
          </Col>

          {/* Column 2: Navigation Links */}
          <Col md={4} className='mb-3 mb-md-0'>
            <Nav className='justify-content-center'>
              <Nav.Link href='/faq' className={styles.footerLink}>
                FAQ
              </Nav.Link>
              <Nav.Link href='/terms' className={styles.footerLink}>
                Terms
              </Nav.Link>
              <Nav.Link href='/privacy' className={styles.footerLink}>
                Privacy Policy
              </Nav.Link>
            </Nav>
          </Col>

          {/* Column 3: License Information */}
          <Col md={4}>
            {showLicense && (
              <div className={styles.licenseSection}>
                <a
                  href='https://github.com/SiloCityLabs/filameter.com/blob/main/LICENSE'
                  target='_blank'
                  rel='license noopener noreferrer'
                  className={styles.licenseLink}>
                  <span>Licensed under CC-BY-SA 4.0</span>
                  <div className={styles.licenseIcons}>
                    {images.map((image, index) => (
                      <Image key={index} src={image.src} alt={image.alt} width={22} height={22} />
                    ))}
                  </div>
                </a>
              </div>
            )}
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
