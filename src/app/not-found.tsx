// --- React ---
import { Container, Row, Col } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import NotFoundRedirector from '@/components/NotFoundRedirector';
import NotFoundContent from '@/components/NotFoundContent';
// --- Styles & Icons ---
import styles from '@/public/styles/components/NotFound.module.css';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you requested could not be found.',
};

export default function NotFound() {
  return (
    <PageLayout>
      <NotFoundRedirector />

      <div className={styles.notFoundPage}>
        <Container>
          <Row className='justify-content-center'>
            <Col md={8} lg={6}>
              <NotFoundContent />
            </Col>
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
