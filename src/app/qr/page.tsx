'use client';

// --- React ---
import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner } from 'react-bootstrap';
// --- Next ---
import { useRouter, useSearchParams } from 'next/navigation';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
// --- Context Hook ---
import { useDatabase } from '@/contexts/DatabaseContext';
// ---DB Helpers ---
import getDocumentByColumn from '@silocitypages/data-access';

export default function QrScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { dbs, isReady: isDbReady, error: dbError } = useDatabase();
  const filamentDb = dbs?.filament;

  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [filamentId, setFilamentId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setIsProcessing(true);
    setLocalError(null);
    setShowAlert(false);

    const currentId = searchParams?.get('id') ?? '';

    if (!currentId) {
      setLocalError('Missing filament ID in URL.');
      setShowAlert(true);
      setAlertMessage('Missing filament ID in URL.');
      setAlertVariant('danger');
      setIsProcessing(false);
      return;
    }

    setFilamentId(currentId);
  }, [searchParams]);

  useEffect(() => {
    if (!isDbReady || !filamentId) {
      return;
    }

    if (dbError) {
      console.error('Database context error:', dbError);
      setLocalError('Database unavailable.');
      setShowAlert(true);
      // Use the error string directly from context
      setAlertMessage(`Database error: ${dbError}`);
      setAlertVariant('danger');
      setIsProcessing(false);
      return;
    }

    if (!filamentDb) {
      console.error('Filament database instance not found in context.');
      setLocalError('Required database (filament) is missing.');
      setShowAlert(true);
      setAlertMessage('Required database (filament) is missing after initialization.');
      setAlertVariant('danger');
      setIsProcessing(false);
      return;
    }

    const fetchFilament = async (id: string) => {
      setLocalError(null);

      try {
        const fetchedFilament = await getDocumentByColumn(filamentDb, '_id', id, 'filament');

        const filamentDoc = Array.isArray(fetchedFilament) ? fetchedFilament : null;

        if (!filamentDoc) {
          router.push(`/manage-filament?id=${id}&type=create`);
        } else {
          router.push(`/manage-filament?id=${id}`);
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch filament data.';
        console.error('Fetch filament error:', err);
        setLocalError(errorMessage);
        setShowAlert(true);
        setAlertMessage(errorMessage);
        setAlertVariant('danger');
        setIsProcessing(false);
      }
    };

    if (!localError) {
      fetchFilament(filamentId);
    }
  }, [filamentId, filamentDb, isDbReady, dbError, router, localError]);

  const isLoading = !isDbReady || isProcessing;
  const hasError = !!localError || !!dbError;

  if (isLoading && !hasError) {
    return (
      <Container className='text-center my-5'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </Spinner>
        <p className='mt-2'>{!isDbReady ? 'Initializing database...' : 'Processing QR Code...'}</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          <h2 className='text-center my-4'>Spool Sense QR Scan</h2>
          <Container
            className='shadow-lg p-3 mb-5 bg-body rounded text-center'
            style={{ maxWidth: '600px', margin: 'auto' }}>
            <Row className='justify-content-md-center'>
              <CustomAlert
                variant={alertVariant}
                message={alertMessage}
                show={showAlert}
                onClose={() => setShowAlert(false)}
              />

              {isLoading && !hasError && (
                <Col lg={8}>
                  <div className='text-center'>
                    <Spinner animation='border' size='sm' className='me-2' />
                    {!isDbReady ? 'Initializing database...' : 'Processing...'}
                  </div>
                </Col>
              )}

              {hasError && !isLoading && (
                <Col lg={8}>
                  <p className='text-danger'>
                    Could not process the QR code. {localError || `Database error: ${dbError}`}
                  </p>
                </Col>
              )}

              {!isLoading && !hasError && (
                <Col lg={8}>
                  <div className='text-center'>
                    Redirecting...
                    <br />
                    {[...Array(5)].map((_, i) => (
                      <Spinner key={i} animation='grow' size='sm' className='mx-1' />
                    ))}
                  </div>
                </Col>
              )}
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
