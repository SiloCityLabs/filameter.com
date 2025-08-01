// --- React ---
import { Container, Row, Col } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import TermsContent from '@/components/legal/TermsContent';
// --- Styles ---
import styles from '@/public/styles/components/Legal.module.css';
// --- Utils ---
import { generateMetadata } from '@/utils/metadata';

export const metadata: Metadata = generateMetadata({
  title: 'Terms And Conditions',
  description: 'The terms and conditions for using the FilaMeter website and application.',
  keywords: ['terms and conditions', 'legal', 'privacy policy'],
});

export default function TermsPage() {
  return (
    <PageLayout>
      <div className={styles.legalPage}>
        <Container>
          <Row className='justify-content-center'>
            <Col lg={10} xl={8}>
              <TermsContent />
            </Col>
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
