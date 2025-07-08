'use client';

// --- React ---
import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
// --- Styles ---
import styles from '@/public/styles/components/home/OpenSourceSection.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faBook, faFileContract } from '@fortawesome/free-solid-svg-icons';

const OpenSourceSection: React.FC = () => {
  const githubUrl = process.env.NEXT_PUBLIC_APP_GITHUB_URL || '#';
  const devSetupUrl = `${githubUrl}/wiki/Developer-Setup`;
  const licenseUrl = 'https://creativecommons.org/licenses/by-sa/4.0/';

  return (
    <section className={styles.openSourceSection} id='open-source'>
      <Container className='text-center'>
        <Row className='justify-content-center'>
          <Col md={10} lg={8}>
            <div className={styles.contentWrapper}>
              <h2 className='display-5 fw-bold'>Built for the Community</h2>
              <p className={`lead ${styles.subtitle}`}>
                FilaMeter is proudly open-source. We welcome pull requests, feature ideas, and bug
                reports. Fork the project to make it your own or join the conversation to help us
                improve.
              </p>
              <Button
                variant='custom'
                size='lg'
                href={githubUrl}
                target='_blank'
                className={styles.ctaButton}>
                <FontAwesomeIcon icon={faGithub} className='me-2' />
                Contribute on GitHub
              </Button>

              <div className={styles.secondaryLinks}>
                <a
                  href={devSetupUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={styles.linkItem}>
                  <FontAwesomeIcon icon={faBook} className='me-2' />
                  Developer Setup Guide
                </a>
                <span className={styles.divider}>|</span>
                <a
                  href={licenseUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className={styles.linkItem}>
                  <FontAwesomeIcon icon={faFileContract} className='me-2' />
                  CC-BY-SA-4.0 License
                </a>
              </div>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default OpenSourceSection;
