'use client';

// --- React ---
import { Container, Row, Col, Button } from 'react-bootstrap';
// --- Layout ---
import PageLayout from '@/components/PageLayout';

export default function OfflinePage() {
  return (
    <PageLayout headerShowBadge={true}>
      <Container className='mt-3 mb-3'>
        <Row className='shadow-lg p-3 bg-body rounded'>
          <Col>
            <h2 className='text-center'>You are offline</h2>

            <div className='text-center'>
              <p>
                It seems you are not connected to the internet. Please check your connection and try
                again.
              </p>
              <Button onClick={() => window.location.reload()} variant='primary' size='sm'>
                Retry
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
}
