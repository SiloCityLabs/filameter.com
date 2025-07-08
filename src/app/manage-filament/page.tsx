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
  const [operationType, setOperationType] = useState<
    'create' | 'edit' | 'duplicate' | 'create-from-existing'
  >('create');
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

    let determinedType: 'create' | 'edit' | 'duplicate' | 'create-from-existing' = 'create';
    if (currentId) {
      if (typeParam === 'duplicate') determinedType = 'duplicate';
      else if (typeParam === 'create')
        determinedType = 'create-from-existing'; // Treat 'create' with ID as a clone operation
      else determinedType = 'edit';
    } else {
      determinedType = 'create';
    }
    setOperationType(determinedType);

    // --- Define Helper ---
    const applyUsedWeight = (data: Filament): Filament => {
      if (usedWeightParam) {
        const parsedWeight = parseInt(usedWeightParam, 10);
        if (!isNaN(parsedWeight)) {
          return { ...data, used_weight: parsedWeight };
        }
      }
      return data;
    };

    // Include 'create-from-existing' in the data fetching logic
    if (
      determinedType === 'edit' ||
      determinedType === 'duplicate' ||
      determinedType === 'create-from-existing'
    ) {
      if (!currentId) {
        setError('Filament ID is missing for edit/duplicate/clone operation.');
        setFilament(applyUsedWeight({ ...defaultValue }));
        setIsLoading(false);
        return;
      }
      if (!dbs.filament) {
        setError('Database connection is not available.');
        setFilament(applyUsedWeight({ ...defaultValue }));
        setIsLoading(false);
        return;
      }

      // Fetch Data Asynchronously
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

          // Apply cloning logic for both 'duplicate' and 'create-from-existing'
          if (determinedType === 'duplicate' || determinedType === 'create-from-existing') {
            const { _id, _rev, calc_weight: _calc_weight, ...clonableData } = fetchedData;
            // Reset used_weight for a new "spool" from clone
            setFilament(applyUsedWeight({ ...defaultValue, ...clonableData, used_weight: 0 }));
          } else {
            // --- Edit ---
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

      fetchData(currentId); // Execute the fetch
    } else {
      // Regular 'create' operation (no ID in URL)
      const initialData: Filament = { ...defaultValue };
      setFilament(applyUsedWeight(initialData));
      setIsLoading(false);
    }
  }, [searchParams, isReady, dbs.filament]);

  const pageTitle =
    operationType === 'edit'
      ? 'Edit Filament'
      : operationType === 'duplicate' || operationType === 'create-from-existing'
        ? 'Duplicate Filament'
        : 'Add New Filament';

  if (isLoading) {
    return (
      <div className={styles.managePage}>
        <Container className='text-center my-5'>
          <Spinner animation='border' role='status'>
            <span className='visually-hidden'>Loading...</span>
          </Spinner>
          <p className='mt-2'>Loading Filament Data...</p>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.managePage}>
        <Container className='my-4'>
          <Alert variant='danger'>
            <Alert.Heading>Error Loading Filament</Alert.Heading>
            <p>{error}</p>
          </Alert>
        </Container>
      </div>
    );
  }

  if (!filament) {
    return (
      <Container className='my-4'>
        <Alert variant='warning'>Could not initialize filament data.</Alert>
      </Container>
    );
  }

  return (
    <div className={styles.managePage}>
      <Container fluid className='py-3'>
        <Row className='justify-content-center'>
          <Col xs={12} md={10} lg={8}>
            {/* Replaced generic div with Card for proper styling */}
            <Card className={styles.formCard}>
              <Card.Body>
                {/* Changed h2 to h1 for consistency with CSS and previous code */}
                <h1 className='text-center mb-4'>{pageTitle}</h1>
                {isReady && dbs.filament ? (
                  <ManageFilament data={filament} db={dbs.filament} />
                ) : (
                  <Alert variant='info' className='text-center'>
                    Database connection is initializing... Form will load shortly.
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
