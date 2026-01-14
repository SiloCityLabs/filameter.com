'use client';

// --- React ---
import React from 'react';
import { Container, Row, Col, Nav } from 'react-bootstrap';

// --- Next ---
import Image from 'next/image';

// --- Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub, faReddit, faFacebook } from '@fortawesome/free-brands-svg-icons';

// --- Styles ---
import styles from '@/public/styles/components/Footer.module.css';

export default function Footer({ className }: { className?: string }) {
  const showLicense =
    process.env.NEXT_PUBLIC_FOOTER_SITE && process.env.NEXT_PUBLIC_FOOTER_COPYRIGHT_URL;
  const version = process.env.NEXT_PUBLIC_APP_VERSION;

  const images = [
    { src: 'https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1', alt: 'CC' },
    { src: 'https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1', alt: 'BY' },
    { src: 'https://mirrors.creativecommons.org/presskit/icons/nc.svg?ref=chooser-v1', alt: 'NC' },
    { src: 'https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1', alt: 'SA' },
  ];

  return (
    <footer id='site-footer' className={`${styles.footer} ${className}`}>
      <Container>
        {/* 4-col layout: lg={3} md={6} */}
        <Row className='align-items-start text-center text-md-start gy-4'>
          {/* Column 1: Copyright and Logo */}
          <Col lg={3} md={6} className='d-flex flex-column align-items-center align-items-md-start'>
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
                {version && (
                  <>
                    <span className='mx-2 text-muted'>•</span>
                    <span className='text-muted small'>v{version}</span>
                  </>
                )}
              </p>
            )}
          </Col>

          {/* ... Rest of the footer remains the same ... */}

          {/* Column 2: Navigation Links */}
          <Col lg={3} md={6}>
            <Nav className='flex-column align-items-center align-items-md-start'>
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

          {/* Column 3: Socials */}
          <Col lg={3} md={6} className='d-flex flex-column align-items-center align-items-md-start'>
            <h6 className={styles.columnTitle}>Connect</h6>
            <div className={styles.socialIcons}>
              <a
                href='https://github.com/SiloCityLabs/filameter.com'
                target='_blank'
                rel='noopener noreferrer'
                className={styles.socialLink}
                aria-label='GitHub'>
                <FontAwesomeIcon icon={faGithub} size='2x' />
              </a>
              <a
                href='https://www.reddit.com/r/FilaMeter/'
                target='_blank'
                rel='noopener noreferrer'
                className={styles.socialLink}
                aria-label='Reddit'>
                <FontAwesomeIcon icon={faReddit} size='2x' />
              </a>
              <a
                href='https://www.facebook.com/SiloCityLabs'
                target='_blank'
                rel='noopener noreferrer'
                className={styles.socialLink}
                aria-label='Facebook'>
                <FontAwesomeIcon icon={faFacebook} size='2x' />
              </a>
            </div>
          </Col>

          {/* Column 4: License Information */}
          <Col lg={3} md={6} className='text-center text-md-start'>
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
