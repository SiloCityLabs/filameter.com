// --- React ---
import { Container, Row, Col } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import PrivacyPolicyContent from '@/components/legal/PrivacyPolicyContent';
// --- Styles ---
import styles from '@/public/styles/components/Legal.module.css';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy outlining how FilaMeter collects, uses, maintains and discloses user information.',
  keywords: ['privacy policy', 'data collection', 'user data', 'filameter', 'local first'],
};

export default function PrivacyPage() {
  return (
    <PageLayout>
      <div className={styles.legalPage}>
        <Container>
          <Row className='justify-content-center'>
            <Col lg={10} xl={8}>
              <PrivacyPolicyContent />
            </Col>
          </Row>
        </Container>
      </div>
    </PageLayout>
  );
}
