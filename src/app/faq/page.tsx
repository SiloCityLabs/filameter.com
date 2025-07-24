// --- React ---
import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import Faq from '@/components/faq/Faq';
// --- Styles ---
import styles from '@/public/styles/components/faq/Faq.module.css';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Frequently Asked Questions',
  description:
    'Find answers to common questions about FilaMeter, the open-source filament inventory manager.',
  keywords: ['faq', 'filameter', 'support', 'questions', '3d printing'],
});

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
