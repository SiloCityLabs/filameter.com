import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import type { Metadata } from 'next';
import PageLayout from '@/components/PageLayout';
import Faq from '@/components/faq/Faq';
import styles from '@/public/styles/components/faq/Faq.module.css';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions',
  description:
    'Find answers to common questions about FilaMeter, the open-source filament inventory manager.',
  keywords: ['faq', 'filameter', 'support', 'questions', '3d printing'],
};

export default function FaqPage() {
  return (
    <PageLayout>
      <div className={styles.faqSection}>
        <Container>
          <Row className='justify-content-center'>
            <Col lg={10} xl={8}>
              <Faq />
            </Col>
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
