// --- React ---
import { Container, Row, Col } from 'react-bootstrap';
// --- Next ---
import type { Metadata } from 'next';
// --- Layout ---
import PageLayout from '@/components/PageLayout';
// --- Components ---
import SettingsTabs from '@/components/settings/SettingsTabs';

export const metadata: Metadata = { title: 'Settings' };

export default function SettingsPage() {
  return (
    <PageLayout headerShowBadge={true}>
      <Container className='mt-3 mb-3'>
        <Row className='shadow-lg p-3 bg-body rounded'>
          <Col>
            <SettingsTabs />
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
}
