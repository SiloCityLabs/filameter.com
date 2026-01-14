// src/components/pro/ProFeatures.tsx
'use client';

// --- React ---
import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
// --- Styles ---
import styles from '@/public/styles/components/pro/ProFeatures.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faRocket } from '@fortawesome/free-solid-svg-icons';

const ProFeatures: React.FC = () => {
  return (
    <>
      <Row className='justify-content-center text-center mb-5'>
        <Col md={8}>
          <h1 className='display-4 fw-bold mb-3'>FilaMeter Pro</h1>
          <p className='lead text-muted'>
            Unlock the full potential of your filament inventory with advanced features designed for
            power users.
          </p>
        </Col>
      </Row>

      <Row className='justify-content-center g-4'>
        {/* Active Feature: Zero-Cooldown Syncing */}
        <Col md={6} lg={5}>
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
    </>
  );
};

export default ProFeatures;
