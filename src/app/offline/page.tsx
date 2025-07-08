'use client';

// --- React ---
import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Styles & Icons ---
import styles from '@/public/styles/components/Offline.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faSyncAlt } from '@fortawesome/free-solid-svg-icons';

export default function OfflinePage() {
  return (
    <PageLayout headerShowBadge={true}>
      <div className={styles.offlinePage}>
        <Container>
          <Row className='justify-content-center'>
            <Col md={8} lg={6}>
              <Card className={styles.statusCard}>
                <Card.Body>
                  <FontAwesomeIcon icon={faGlobe} className={styles.statusIcon} />
                  <h1 className={styles.statusTitle}>You Are Offline</h1>
                  <p className='text-muted mt-2 mb-4'>
                    It seems you are not connected to the internet. Please check your connection and
                    try again.
                  </p>
                  <Button onClick={() => window.location.reload()} variant='primary' size='lg'>
                    <FontAwesomeIcon icon={faSyncAlt} className='me-2' />
                    Retry Connection
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
