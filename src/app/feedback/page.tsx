'use client';

// --- React ---
import React, { Suspense } from 'react';
import { Container, Row, Col, Spinner, Card } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Components ---
import FeedbackForm from '@/components/feedback/FeedbackForm';
// --- Styles ---
import styles from '@/public/styles/components/Feedback.module.css';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Feedback',
  description: 'Provide feedback or report an issue via GitHub.',
});

export default function FeedbackPage() {
  return (
    <div className={styles.feedbackPage}>
      <Container>
        <Row className='justify-content-center'>
          <Col lg={10} xl={8}>
            <Card className={styles.formCard}>
              <Card.Body>
                <div className='text-center'>
                  <h1 className={styles.pageTitle}>Submit Feedback</h1>
                  <p className='text-muted'>
                    Have a bug report or a feature request? Let us know! Your feedback helps improve
                    FilaMeter.
                  </p>
                </div>
                <Suspense
                  fallback={
                    <div className='text-center py-5'>
                      <Spinner animation='border' variant='primary' role='status'>
                        <span className='visually-hidden'>Loading Form...</span>
                      </Spinner>
                    </div>
                  }>
                  <FeedbackForm />
                </Suspense>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
