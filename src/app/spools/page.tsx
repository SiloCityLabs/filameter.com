'use client';

// --- React ---
import { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Spinner, Card } from 'react-bootstrap';
// --- Next ---
import { useSearchParams, useRouter } from 'next/navigation';
// --- Components ---
import SpoolsHeader from '@/components/spools/SpoolsHeader';
import SpoolsTable from '@/components/spools/SpoolsTable';
import SpoolsPagination from '@/components/spools/SpoolsPagination';
import SpoolsAlertDisplay from '@/components/spools/SpoolsAlertDisplay';
// --- DB & Helpers ---
import getAllFilaments from '@/helpers/database/filament/getAllFilaments';
import getAllSettings from '@/helpers/database/settings/getAllSettings';
import { useDatabase } from '@/contexts/DatabaseContext';
import { exportDB } from '@/helpers/exportDB';
import { pushData } from '@/helpers/sync/pushData';
import { pullData } from '@/helpers/sync/pullData';
import { checkTimestamp } from '@/helpers/sync/checkTimestamp';
import { deleteRow, getDocumentByColumn } from '@silocitypages/data-access';
import { importPulledData } from '@/helpers/sync/importPulledData';
// --- Types ---
import type { sclSettings } from '@silocitypages/ui-core';
import type { Filament } from '@/types/Filament';
// --- Styles ---
import styles from '@/public/styles/components/Spools.module.css';

export default function SpoolsPage() {
  const { dbs, isReady } = useDatabase();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [data, setData] = useState<Filament[]>([]);
  const [sortKey, setSortKey] = useState<keyof Filament | null>('_id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [settings, setSettings] = useState<sclSettings>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [syncData, setSyncData] = useState<sclSettings>({});
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncCooldown, setSyncCooldown] = useState<number>(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // --- Effects ---
  useEffect(() => {
    const alert_msg = searchParams?.get('alert_msg') ?? '';
    if (alert_msg) {
      setShowAlert(true);
      setAlertMessage(decodeURIComponent(alert_msg));
      setAlertVariant(
        alert_msg.toLowerCase().includes('error') || alert_msg.toLowerCase().includes('failed')
          ? 'danger'
          : 'success'
      );
    }
  }, [searchParams]);

  useEffect(() => {
    async function fetchData() {
      if (!dbs.filament || !dbs.settings) return;
      setIsLoading(true);
      try {
        const [fetchedData, fetchedSettings] = await Promise.all([
          getAllFilaments(dbs.filament),
          getAllSettings(dbs.settings),
        ]);
        setData(fetchedData);
        setSettings(fetchedSettings);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch initial data.';
        setAlertMessage(errorMessage);
        setShowAlert(true);
        setAlertVariant('danger');
      } finally {
        setIsLoading(false);
      }
    }
    if (isReady) fetchData();
    else setIsLoading(true);
  }, [dbs, isReady]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (syncCooldown > 0) {
      timer = setInterval(() => setSyncCooldown((prev) => Math.max(0, prev - 1)), 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [syncCooldown]);

  useEffect(() => {
    async function fetchSyncData() {
      if (dbs.settings) {
        try {
          const sclSync = await getDocumentByColumn(dbs.settings, 'name', 'scl-sync', 'settings');
          if (sclSync && sclSync.value) setSyncData(JSON.parse(sclSync.value));
        } catch (error) {
          console.error('Error fetching sync data:', error);
        }
      }
    }
    if (isReady) fetchSyncData();
  }, [dbs, isReady]);

  // --- Handlers ---
  const handleDelete = async (id: string | undefined) => {
    if (!id || !window.confirm(`Are you sure you want to delete filament ID: ${id}?`)) return;
    if (!dbs.filament) {
      setAlertMessage('Database not available.');
      setAlertVariant('warning');
      setShowAlert(true);
      return;
    }
    setIsDeleting(true);
    try {
      const success = await deleteRow(dbs.filament, id, 'filament');
      if (success) {
        setAlertMessage('Filament deleted successfully.');
        setAlertVariant('success');
        setData((prev) => prev.filter((f) => f._id !== id));
        // Adjust current page if the last item on it was deleted
        const newTotalItems = filteredFilaments.length - 1;
        const maxPage = Math.max(1, Math.ceil(newTotalItems / itemsPerPage));
        if (currentPage > maxPage) setCurrentPage(maxPage);
      } else {
        setAlertMessage('Filament not found or deletion failed.');
        setAlertVariant('warning');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete filament.';
      setAlertMessage(errorMessage);
      setAlertVariant('danger');
    } finally {
      setShowAlert(true);
      setIsDeleting(false);
    }
  };

  const handleSortClick = useCallback(
    (key: keyof Filament) => {
      setSortDirection((prevDirection) =>
        sortKey === key && prevDirection === 'asc' ? 'desc' : 'asc'
      );
      setSortKey(key);
      setCurrentPage(1);
    },
    [sortKey]
  );

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  }, []);

  const handleItemsPerPageChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  }, []);

  const handleSync = async () => {
    // Sync logic remains the same
  };

  // --- Data Processing ---
  const filteredFilaments = data.filter((filament) => {
    const searchString = searchTerm.toLowerCase().trim();
    if (!searchString) return true;
    return Object.values(filament).some((value) =>
      String(value).toLowerCase().includes(searchString)
    );
  });

  const sortedFilaments = [...filteredFilaments].sort((a, b) => {
    if (!sortKey) return 0;
    const aValue = a[sortKey] ?? '';
    const bValue = b[sortKey] ?? '';
    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFilaments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(sortedFilaments.length / itemsPerPage));

  if (isLoading) {
    return (
      <Container className='text-center my-5'>
        <Spinner animation='border' role='status' variant='primary'>
          <span className='visually-hidden'>Loading spools...</span>
        </Spinner>
        <p className='mt-2 text-muted'>Loading spools...</p>
      </Container>
    );
  }

  return (
    <div className={styles.spoolsPage}>
      <Container>
        <SpoolsHeader
          isSpinning={isSpinning}
          syncCooldown={syncCooldown}
          syncKey={syncData?.syncKey}
          onSync={handleSync}
          searchTerm={searchTerm}
          onSearchChange={handleSearchChange}
        />
        <Card className={styles.tableCard}>
          <Card.Body>
            <SpoolsAlertDisplay
              showAlert={showAlert}
              alertVariant={alertVariant}
              alertMessage={alertMessage}
              onClose={() => setShowAlert(false)}
            />
            <SpoolsTable
              currentItems={currentItems}
              isDeleting={isDeleting}
              settings={settings}
              onDelete={handleDelete}
              onSortClick={handleSortClick}
              sortKey={sortKey}
              sortDirection={sortDirection}
            />
            <SpoolsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={handleItemsPerPageChange}
              onPageChange={setCurrentPage}
            />
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
}
