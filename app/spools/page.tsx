'use client';

// --- React ---
import { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  Button,
  OverlayTrigger,
  Tooltip,
  Pagination,
  Spinner,
} from 'react-bootstrap';
// --- Next ---
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
// --- Components ---
import CustomAlert from '@/components/_silabs/bootstrap/CustomAlert';
// --- DB ---
import deleteRow from '@/helpers/_silabs/pouchDb/deleteRow';
import getAllFilaments from '@/helpers/database/filament/getAllFilaments';
import getAllSettings from '@/helpers/database/settings/getAllSettings';
import { useDatabase } from '@/contexts/DatabaseContext';
import { exportDB } from '@/helpers/exportDB';
import { pushData } from '@/helpers/sync/pushData';
import { pullData, checkTimestamp } from '@/helpers/sync/pullData';
import getDocumentByColumn from '@/helpers/_silabs/pouchDb/getDocumentByColumn';
import { importPulledData } from '@/helpers/sync/importPulledData';
// --- Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faCopy, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
// --- Types ---
import type { sclSettings } from '@/types/_fw';
import type { Filament } from '@/types/Filament';

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

  // Effect to check for alert message from URL parameters on initial load
  useEffect(() => {
    const alert_msg = searchParams?.get('alert_msg') ?? '';

    if (alert_msg) {
      setShowAlert(true);
      setAlertMessage(decodeURIComponent(alert_msg));
      if (alert_msg.toLowerCase().includes('error') || alert_msg.toLowerCase().includes('failed')) {
        setAlertVariant('danger');
      } else {
        setAlertVariant('success');
      }
    }
  }, [searchParams, router]);

  useEffect(() => {
    async function fetchData() {
      if (!dbs.filament || !dbs.settings) {
        console.warn('Database instances not yet available.');
        return;
      }

      setIsLoading(true);
      let fetchedData: Filament[] = [];
      let fetchedSettings: sclSettings = {};

      try {
        // Fetch concurrently
        [fetchedData, fetchedSettings] = await Promise.all([
          getAllFilaments(dbs.filament),
          getAllSettings(dbs.settings),
        ]);
        setData(fetchedData);
        setSettings(fetchedSettings);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch initial data.';
        setAlertMessage(errorMessage);
        setShowAlert(true);
        setAlertVariant('danger');
        console.error('Data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    if (isReady) {
      fetchData();
    } else {
      setIsLoading(true);
    }
  }, [dbs, isReady]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (syncCooldown > 0) {
      timer = setInterval(() => {
        setSyncCooldown((prev) => Math.max(0, prev - 1));
      }, 1000);
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
          if (sclSync && sclSync.value !== '') {
            setSyncData(JSON.parse(sclSync.value));
          }
        } catch (error) {
          console.error('Error fetching sync data:', error);
        }
      }
    }

    if (isReady) {
      fetchSyncData();
    }
  }, [dbs, isReady]);

  // --- Event Handlers ---
  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      setAlertMessage('Cannot delete: Invalid filament ID.');
      setAlertVariant('danger');
      setShowAlert(true);
      return;
    }

    if (!window.confirm(`Are you sure you want to delete filament ID: ${id}?`)) {
      return;
    }

    if (!dbs.filament) {
      setAlertMessage('Database not available for deletion.');
      setAlertVariant('warning');
      setShowAlert(true);
      return;
    }

    setIsDeleting(true);
    try {
      const success = await deleteRow(dbs.filament, id, 'filament');
      setShowAlert(true);
      if (success) {
        setAlertMessage('Filament deleted successfully.');
        setAlertVariant('success');
        setData((currentData) => currentData.filter((f) => f._id !== id));
        const newTotalItems = filteredFilaments.length - 1;
        const maxPage = Math.max(1, Math.ceil(newTotalItems / itemsPerPage));
        if (currentPage > maxPage) {
          setCurrentPage(maxPage);
        }
      } else {
        setAlertMessage('Filament not found or deletion failed.');
        setAlertVariant('warning');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete filament.';
      setAlertVariant('danger');
      setAlertMessage(errorMessage);
      setShowAlert(true);
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSortClick = (key: keyof Filament) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const canSync = () => {
    if (!lastSyncTime) return true;
    const now = Date.now();
    return now - lastSyncTime >= 60000; // 60 seconds
  };

  const handleSync = async () => {
    if (!canSync()) {
      setAlertMessage('Please wait 60 seconds between syncs');
      setAlertVariant('warning');
      setShowAlert(true);
      return;
    }

    try {
      setIsSpinning(true);
      // Check timestamp first
      const timestampResponse = await checkTimestamp(syncData.syncKey);
      if (timestampResponse.status === 'success') {
        const cloudTimestamp = new Date(timestampResponse.timestamp).getTime();
        const localTimestamp = syncData.lastSynced ? new Date(syncData.lastSynced).getTime() : 0;

        if (cloudTimestamp > localTimestamp) {
          // Pull new data
          const pullResponse = await pullData(syncData.syncKey);
          if (pullResponse.status === 'success') {
            if (!dbs.filament || !dbs.settings) {
              throw new Error('Database instances not initialized');
            }
            const importResult = await importPulledData(
              { filament: dbs.filament, settings: dbs.settings },
              pullResponse
            );
            if (importResult.success) {
              setAlertMessage('Data synced successfully');
              setAlertVariant('success');
              setLastSyncTime(Date.now());
              setSyncCooldown(60);
              // Refresh data
              const [newData, newSettings] = await Promise.all([
                getAllFilaments(dbs.filament),
                getAllSettings(dbs.settings),
              ]);
              setData(newData);
              setSettings(newSettings);
            } else {
              throw new Error(importResult.message);
            }
          } else {
            throw new Error(pullResponse.message || 'Failed to pull data');
          }
        } else if (dbs.filament) {
          // Push data if local is newer
          const exportData = await exportDB(dbs.filament, false);
          if (exportData) {
            const pushResponse = await pushData(syncData.syncKey, exportData);
            if (pushResponse.status === 'success') {
              setAlertMessage('Data pushed to cloud successfully');
              setAlertVariant('success');
              setLastSyncTime(Date.now());
              setSyncCooldown(60);
            } else {
              throw new Error(pushResponse.message || 'Failed to push data');
            }
          }
        } else {
          setAlertMessage('No new data to sync');
          setAlertVariant('info');
        }
      } else {
        throw new Error(timestampResponse.error || 'Failed to check sync status');
      }
    } catch (error) {
      console.error('Sync failed:', error);
      setAlertMessage(error instanceof Error ? error.message : 'Sync failed. Please try again.');
      setAlertVariant('danger');
    } finally {
      setIsSpinning(false);
      setShowAlert(true);
    }
  };

  // --- Data Processing (Filtering, Sorting, Pagination) ---
  const filteredFilaments = data.filter((filament) => {
    const searchString = searchTerm.toLowerCase().trim();
    if (!searchString) return true;

    return (
      filament._id?.toLowerCase().includes(searchString) ||
      filament.filament?.toLowerCase().includes(searchString) ||
      filament.material?.toLowerCase().includes(searchString) ||
      filament.location?.toLowerCase().includes(searchString)
    );
  });

  const sortedFilaments = [...filteredFilaments].sort((a, b) => {
    if (!sortKey) return 0;

    // Handle potential undefined values during sort
    const aValue = a[sortKey] ?? '';
    const bValue = b[sortKey] ?? '';

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      // Basic comparison for mixed or other types
      comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
    }

    return sortDirection === 'asc' ? comparison : -comparison;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedFilaments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(sortedFilaments.length / itemsPerPage)); // Ensure at least 1 page

  // --- Render Helpers ---
  const renderHeader = (key: keyof Filament, title: string) => {
    // Check if header should be rendered based on settings
    if (settings?.spoolHeaders && settings.spoolHeaders[title] === false) {
      return null;
    }

    return (
      <th
        className='text-center align-middle'
        style={{ cursor: 'pointer' }}
        onClick={() => handleSortClick(key)}>
        {title}{' '}
        {sortKey === key ? (
          sortDirection === 'asc' ? (
            '▲'
          ) : (
            '▼'
          )
        ) : (
          <span style={{ color: 'lightgrey' }}>▲▼</span>
        )}
      </th>
    );
  };

  // Show loading spinner if fetching initial data or context isn't ready
  if (isLoading) {
    return (
      <Container className='text-center my-5'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading spools...</span>
        </Spinner>
        <p className='mt-2'>Loading spools...</p>
      </Container>
    );
  }

  return (
    <Container className='mt-3 mb-3'>
      <Row className='shadow-lg p-3 bg-body rounded'>
        <Col>
          <Row className='mb-3'>
            <Col>
              <h1>Spools</h1>
            </Col>
            <Col xs='auto'>
              <Button
                variant='primary'
                disabled={isSpinning || syncCooldown > 0 || !syncData.syncKey}
                onClick={handleSync}>
                <FontAwesomeIcon icon={faCloudArrowUp} className='me-2' />
                {syncCooldown > 0 ? `Sync (${syncCooldown}s)` : 'Sync'}
              </Button>
            </Col>
          </Row>
          <Row>
            <Col xs={12} className='mb-3'>
              <CustomAlert
                variant={alertVariant}
                message={alertMessage}
                show={showAlert}
                onClose={() => setShowAlert(false)}
              />
            </Col>
          </Row>
          <Row>
            <Col xs={12} md={8} className='mb-2'>
              <Form.Control
                type='text'
                placeholder='Search by ID, Name, Material, Location...'
                value={searchTerm}
                onChange={handleSearchChange}
                size='sm'
              />
            </Col>
            <Col xs={12} md={4} className='text-md-end mb-2'>
              <Link href='/manage-filament' passHref>
                <Button variant='primary' size='sm' className='w-50 w-md-auto'>
                  Add Filament
                </Button>
              </Link>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <div className='table-responsive'>
                <Table striped bordered hover size='sm' className='align-middle'>
                  <thead>
                    <tr>
                      {renderHeader('_id', 'ID')}
                      {renderHeader('filament', 'Filament')}
                      {renderHeader('material', 'Material')}
                      {renderHeader('used_weight', 'Used (g)')}
                      {renderHeader('total_weight', 'Total (g)')}
                      {renderHeader('calc_weight', 'Remaining (g)')}
                      {renderHeader('location', 'Location')}
                      {renderHeader('comments', 'Comments')}
                      <th className='text-center align-middle'>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isDeleting && (
                      <tr>
                        <td colSpan={9} className='text-center text-muted'>
                          <Spinner animation='border' size='sm' className='me-2' /> Deleting...
                        </td>
                      </tr>
                    )}
                    {!isDeleting && currentItems.length > 0
                      ? currentItems.map((filament) => (
                          <tr key={`filament-${filament._id}`}>
                            {(!settings?.spoolHeaders || settings.spoolHeaders['ID'] !== false) && (
                              <td className='text-center'>
                                <OverlayTrigger
                                  placement='top'
                                  delay={{ show: 400, hide: 250 }}
                                  overlay={
                                    <Tooltip style={{ position: 'fixed' }}>
                                      {filament._id || 'N/A'}
                                    </Tooltip>
                                  }>
                                  <span style={{ cursor: 'help' }}>
                                    {filament._id ? `${filament._id.substring(0, 5)}...` : 'N/A'}
                                  </span>
                                </OverlayTrigger>
                              </td>
                            )}
                            {(!settings?.spoolHeaders ||
                              settings.spoolHeaders['Filament'] !== false) && (
                              <td className='text-center'>{filament.filament}</td>
                            )}
                            {(!settings?.spoolHeaders ||
                              settings.spoolHeaders['Material'] !== false) && (
                              <td className='text-center'>{filament.material}</td>
                            )}
                            {(!settings?.spoolHeaders ||
                              settings.spoolHeaders['Used (g)'] !== false) && (
                              <td className='text-center'>{filament.used_weight}</td>
                            )}
                            {(!settings?.spoolHeaders ||
                              settings.spoolHeaders['Total (g)'] !== false) && (
                              <td className='text-center'>{filament.total_weight}</td>
                            )}
                            {(!settings?.spoolHeaders ||
                              settings.spoolHeaders['Remaining (g)'] !== false) && (
                              <td className='text-center'>{filament?.calc_weight ?? ''}</td>
                            )}
                            {(!settings?.spoolHeaders ||
                              settings.spoolHeaders['Location'] !== false) && (
                              <td className='text-center'>{filament.location}</td>
                            )}
                            {(!settings?.spoolHeaders ||
                              settings.spoolHeaders['Comments'] !== false) && (
                              <td className='text-center'>
                                {filament.comments && filament.comments.length > 20 ? (
                                  <OverlayTrigger
                                    placement='top'
                                    delay={{ show: 400, hide: 250 }}
                                    overlay={
                                      <Tooltip style={{ position: 'fixed' }}>
                                        {filament.comments}
                                      </Tooltip>
                                    }>
                                    <span
                                      style={{ cursor: 'help' }}>{`${filament.comments.substring(
                                      0,
                                      17
                                    )}...`}</span>
                                  </OverlayTrigger>
                                ) : (
                                  filament.comments
                                )}
                              </td>
                            )}

                            <td className='text-center'>
                              <div className='d-flex justify-content-center align-items-center flex-nowrap'>
                                <OverlayTrigger
                                  placement='top'
                                  overlay={<Tooltip style={{ position: 'fixed' }}>Edit</Tooltip>}>
                                  <Link href={`/manage-filament?id=${filament._id}`} passHref>
                                    <Button
                                      variant='outline-primary'
                                      size='sm'
                                      className='me-1 py-0 px-1'>
                                      <FontAwesomeIcon icon={faPenToSquare} />
                                    </Button>
                                  </Link>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement='top'
                                  overlay={<Tooltip style={{ position: 'fixed' }}>Delete</Tooltip>}>
                                  <Button
                                    variant='outline-danger'
                                    size='sm'
                                    className='me-1 py-0 px-1'
                                    onClick={() => handleDelete(filament._id)}
                                    disabled={isDeleting}>
                                    <FontAwesomeIcon icon={faTrash} />
                                  </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement='top'
                                  overlay={
                                    <Tooltip style={{ position: 'fixed' }}>Duplicate</Tooltip>
                                  }>
                                  <Link
                                    href={`/manage-filament?id=${filament._id}&type=duplicate`}
                                    passHref>
                                    <Button
                                      variant='outline-secondary'
                                      size='sm'
                                      className='py-0 px-1'>
                                      <FontAwesomeIcon icon={faCopy} />
                                    </Button>
                                  </Link>
                                </OverlayTrigger>
                              </div>
                            </td>
                          </tr>
                        ))
                      : !isDeleting && (
                          <tr>
                            <td colSpan={9} className='text-center fst-italic text-muted'>
                              No spools found matching your criteria.
                            </td>
                          </tr>
                        )}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>
          {/* Pagination and Items Per Page Selector */}
          {!isLoading && sortedFilaments.length > itemsPerPage && (
            <Row>
              <Col xs={12} className='d-flex justify-content-between align-items-center mt-3'>
                <Pagination size='sm' className='mb-0'>
                  <Pagination.Prev
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  />
                  <Pagination.Item active>{currentPage}</Pagination.Item>
                  {currentPage < totalPages && <Pagination.Ellipsis disabled />}
                  {currentPage < totalPages && (
                    <Pagination.Item onClick={() => setCurrentPage(totalPages)}>
                      {totalPages}
                    </Pagination.Item>
                  )}
                  <Pagination.Next
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                  />
                </Pagination>
                <div className='d-flex align-items-center'>
                  <span className='me-2 text-muted' style={{ fontSize: '0.8rem' }}>
                    Items/page:
                  </span>
                  <Form.Select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
                    size='sm'
                    style={{ width: 'auto' }}
                    aria-label='Items per page'>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </Form.Select>
                </div>
              </Col>
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}
