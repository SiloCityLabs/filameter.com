'use client';

// --React ---
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
// --- Styles ---
import styles from '@/public/styles/components/home/Sync.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faKey, faBolt } from '@fortawesome/free-solid-svg-icons';

const syncSteps = [
  {
    icon: <FontAwesomeIcon icon={faSyncAlt} />,
    title: 'Multiple Device Support',
    description: 'Keep your filament data accessible and consistent across all your devices.',
  },
  {
    icon: <FontAwesomeIcon icon={faBolt} />,
    title: 'Sync with free and paid versions.',
    description:
      'Free users can sync manually once every 60 seconds, making it easy to move between devices when needed. Paid users have data synced across their devices automatically.',
  },
  {
    icon: <FontAwesomeIcon icon={faKey} />,
    title: 'How it Works',
    description:
      'A unique and secure sync key is used to encrypt and transfer your data. No complex setups, just simple, secure syncing.',
  },
];

const SyncSection: React.FC = () => {
  return (
    <section className={styles.syncSection} id='sync'>
      <Container>
        {/* Section Header */}
        <Row className='justify-content-center text-center mb-5'>
          <Col md={8}>
            <h2 className='display-5 fw-bold'>Sync Your Data Securely</h2>
            <p className='lead text-muted'>
              Access your filament inventory anywhere. Our optional sync feature keeps you in
              control.
            </p>
          </Col>
        </Row>

        {/* Sync Steps Timeline */}
        <Row className='justify-content-center'>
          <Col lg={10}>
            <div className={styles.timeline}>
              {syncSteps.map((step, index) => (
                <div key={index} className={styles.timelineItem}>
                  <div className={styles.timelineIcon}>{step.icon}</div>
                  <div className={styles.timelineContent}>
                    <h5 className='fw-bold'>{step.title}</h5>
                    <p className='text-muted mb-0'>{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default SyncSection;
