'use client';

// --- React ---
import { useEffect, useState } from 'react';
import { Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
// --- Next ---
import { useSearchParams } from 'next/navigation';
// --- Components ---
import ManageFilament from '@/components/ManageFilament';
// --- DB ---
import { getDocumentByColumn } from '@silocitypages/data-access';
import { useDatabase } from '@/contexts/DatabaseContext';
// --- Types ---
import { Filament } from '@/types/Filament';

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

    if (determinedType === 'edit' || determinedType === 'duplicate') {
      if (!currentId) {
        setError('Filament ID is missing for edit/duplicate operation.');
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
          // Assuming getDocumentByColumn returns the single document or null/throws
          const fetchedData: Filament = await getDocumentByColumn(
            dbs.filament!,
            '_id',
            id,
            'filament'
          );

          if (!fetchedData) {
            // Check if data is actually found
            throw new Error(`Filament with ID "${id}" not found.`);
          }

          if (determinedType === 'duplicate') {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, _rev, calc_weight, ...duplicableData } = fetchedData;
            // Reset used_weight for duplicate, apply other fetched vals over default
            setFilament(applyUsedWeight({ ...defaultValue, ...duplicableData, used_weight: 0 }));
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
      // Create Operation
      const initialData: Filament = { ...defaultValue };
      if (currentId && typeParam === 'create') {
        // Handle create with pre-filled ID if needed
        initialData._id = currentId;
      }
      setFilament(applyUsedWeight(initialData));
      setIsLoading(false);
    }
  }, [searchParams, isReady, dbs.filament]);

  if (isLoading) {
    return (
      <Container className='text-center my-5'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </Spinner>
        <p className='mt-2'>Loading Filament Data...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className='my-4'>
        <Alert variant='danger'>
          <Alert.Heading>Error Loading Filament</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!filament) {
    return (
      <Container className='my-4'>
        <Alert variant='warning'>Could not initialize filament data.</Alert>
      </Container>
    );
  }

  const pageTitle = operationType === 'edit' ? 'Edit Filament' : 'Add Filament';

  return (
    <Container fluid className='py-3'>
      <Row className='justify-content-center'>
        <Col xs={12} md={10} lg={8}>
          <div className='shadow-lg p-3 p-md-4 bg-body rounded'>
            <h2 className='text-center mb-4'>{pageTitle}</h2>
            {isReady && dbs.filament ? (
              <ManageFilament data={filament} db={dbs.filament} />
            ) : (
              <Alert variant='info' className='text-center'>
                Database connection is initializing... Form will load shortly.
              </Alert>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
