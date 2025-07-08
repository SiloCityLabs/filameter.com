'use client';

// --- React ---
import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Card } from 'react-bootstrap';
// --- Next ---
import { useRouter, useSearchParams } from 'next/navigation';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
// --- Context Hook ---
import { useDatabase } from '@/contexts/DatabaseContext';
// --- DB Helpers ---
import { getDocumentByColumn } from '@silocitypages/data-access';
// --- Styles & Icons ---
import styles from '@/public/styles/components/Qr.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQrcode, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

export default function QrScanPage() {
  // --- STATE AND LOGIC (UNCHANGED FROM YOUR ORIGINAL) ---
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

  // --- JSX / STYLING (UPDATED) ---
  const isLoading = !isDbReady || isProcessing;
  const hasError = !!localError || !!dbError;

  const renderContent = () => {
    if (isLoading && !hasError) {
      return (
        <>
          <FontAwesomeIcon icon={faQrcode} className={styles.statusIcon} />
          <h2 className={styles.statusTitle}>Processing QR Code</h2>
          <p className='text-muted'>
            {!isDbReady ? 'Initializing database...' : 'Looking for your spool...'}
          </p>
          <Spinner animation='border' variant='primary' role='status' className='mt-3'>
            <span className='visually-hidden'>Loading...</span>
          </Spinner>
        </>
      );
    }
    // This state covers both error and non-loading states to show the alert correctly.
    return (
      <>
        {hasError ? (
          <>
            <FontAwesomeIcon
              icon={faExclamationTriangle}
              className={`${styles.statusIcon} text-danger`}
            />
            <h2 className={styles.statusTitle}>Processing Error</h2>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faQrcode} className={styles.statusIcon} />
            <h2 className={styles.statusTitle}>Redirecting...</h2>
            <div className='mt-3'>
              {[...Array(5)].map((_, i) => (
                <Spinner key={i} animation='grow' size='sm' className='mx-1' variant='primary' />
              ))}
            </div>
          </>
        )}
        <div className='w-100 mt-4'>
          <CustomAlert
            variant={alertVariant || 'info'}
            message={alertMessage || 'An unexpected issue occurred.'}
            show={showAlert}
            onClose={() => setShowAlert(false)}
          />
        </div>
      </>
    );
  };

  return (
    <div className={styles.qrPage}>
      <Container>
        <Row className='justify-content-center'>
          <Col md={8} lg={6}>
            <Card className={styles.statusCard}>
              <Card.Body>{renderContent()}</Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
