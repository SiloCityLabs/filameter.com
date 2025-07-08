'use client';

// --- React ---
import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert, Card } from 'react-bootstrap';
// --- Next ---
import { useSearchParams } from 'next/navigation';
// --- Components ---
import ManageFilament from '@/components/ManageFilament';
// --- DB ---
import { getDocumentByColumn } from '@silocitypages/data-access';
import { useDatabase } from '@/contexts/DatabaseContext';
// --- Types ---
import { Filament } from '@/types/Filament';
// --- Styles ---
import styles from '@/public/styles/components/ManageFilament.module.css';

// --- Default Value ---
const defaultValue: Omit<Filament, '_id' | '_rev'> = {
  filament: '',
  material: '',
  used_weight: 0,
  total_weight: 1000,
  location: '',
  comments: '',
};

export default function ManageFilamentPage() {
  const { dbs, isReady } = useDatabase();
  const searchParams = useSearchParams();
  const [filament, setFilament] = useState<Filament | null>(null);
  const [operationType, setOperationType] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!searchParams || !isReady) {
      setIsLoading(!isReady);
      return;
    }

    setIsLoading(true);
    setError(null);

    const currentId = searchParams.get('id') ?? null;
    const typeParam = searchParams.get('type') ?? '';
    const usedWeightParam = searchParams.get('used_weight') ?? '';

    let determinedType: 'create' | 'edit' | 'duplicate' = 'create';
    if (currentId) {
      if (typeParam === 'duplicate') determinedType = 'duplicate';
      else if (typeParam === 'create') determinedType = 'create';
      else determinedType = 'edit';
    } else {
      determinedType = 'create';
    }
    setOperationType(determinedType);

    const applyUsedWeight = (data: Filament): Filament => {
      if (usedWeightParam) {
        const parsedWeight = parseInt(usedWeightParam, 10);
        if (!isNaN(parsedWeight)) {
          return { ...data, used_weight: parsedWeight };
        }
      }
      return data;
    };

    if (determinedType === 'edit' || determinedType === 'duplicate') {
      if (!currentId || !dbs.filament) {
        setError(currentId ? 'Database connection is not available.' : 'Filament ID is missing.');
        setFilament(applyUsedWeight({ ...defaultValue }));
        setIsLoading(false);
        return;
      }

      const fetchData = async (id: string) => {
        try {
          const fetchedData: Filament = await getDocumentByColumn(
            dbs.filament!,
            '_id',
            id,
            'filament'
          );
          if (!fetchedData) {
            throw new Error(`Filament with ID "${id}" not found.`);
          }
          if (determinedType === 'duplicate') {
            const { _id, _rev, calc_weight: _calc_weight, ...duplicableData } = fetchedData;
            setFilament(applyUsedWeight({ ...defaultValue, ...duplicableData, used_weight: 0 }));
          } else {
            setFilament(applyUsedWeight(fetchedData));
          }
        } catch (err: unknown) {
          const message =
            err instanceof Error ? err.message : 'An unknown error occurred during fetch.';
          console.error('Fetch filament error:', err);
          setError(`Failed to load filament data: ${message}`);
          setFilament(applyUsedWeight({ ...defaultValue }));
        } finally {
          setIsLoading(false);
        }
      };
      fetchData(currentId);
    } else {
      const initialData: Filament = { ...defaultValue };
      if (currentId && typeParam === 'create') {
        initialData._id = currentId;
      }
      setFilament(applyUsedWeight(initialData));
      setIsLoading(false);
    }
  }, [searchParams, isReady, dbs.filament]);

  if (isLoading) {
    return (
      <div className={styles.managePage}>
        <Container className='text-center'>
          <Spinner animation='border' variant='primary' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </Spinner>
          <p className='mt-2 text-muted'>Loading Filament Data...</p>
        </Container>
      </div>
    );
  }

  const pageTitle =
    operationType === 'edit'
      ? 'Edit Filament'
      : operationType === 'duplicate'
        ? 'Duplicate Filament'
        : 'Add New Filament';

  return (
    <div className={styles.managePage}>
      <Container>
        <Row className='justify-content-center'>
          <Col xs={12} md={10} lg={8}>
            <Card className={styles.formCard}>
              <Card.Body>
                <h1 className='text-center mb-4'>{pageTitle}</h1>
                {error && (
                  <Alert variant='danger'>
                    <Alert.Heading>Error Loading Filament</Alert.Heading>
                    <p>{error}</p>
                  </Alert>
                )}
                {!filament && !error && (
                  <Alert variant='warning'>Could not initialize filament data.</Alert>
                )}
                {isReady && dbs.filament && filament ? (
                  <ManageFilament data={filament} db={dbs.filament} />
                ) : (
                  !error && (
                    <Alert variant='info' className='text-center'>
                      Database connection is initializing...
                    </Alert>
                  )
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
