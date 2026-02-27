'use client';

// --- React ---
import { useCallback, useState, useEffect } from 'react';
// --- Components ---
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
import CsvMappingModal from '@/components/settings/CsvMappingModal';
// --- Context ---
import { useDatabase } from '@/contexts/DatabaseContext';
// --- Hooks & Helpers ---
import { exportDB } from '@/helpers/exportDB';
import { importDB } from '@/helpers/importDB';
import { useScrollToTop } from '@/hooks/useScrollToTop';
// --- Types ---
import { Filament } from '@/types/Filament';
// --- Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileExport,
  faFileImport,
  faFileCsv,
  faTrash,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
// --- Styles ---
import styles from '@/public/styles/components/Settings.module.css';

export default function ImportExport() {
  const { dbs, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [clearBeforeImport, setClearBeforeImport] = useState(false);
  const [triggerImport, setTriggerImport] = useState(false);

  const { ref: topRef, scrollToTop } = useScrollToTop();

  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('selectedFile')) {
      const fileData = JSON.parse(localStorage.getItem('selectedFile')!);
      const file = new File([new Blob([fileData.content])], fileData.name, { type: fileData.type });
      const shouldTriggerImport = localStorage.getItem('triggerImport') === 'true';

      setSelectedFile(file);
      localStorage.removeItem('selectedFile');

      if (shouldTriggerImport) {
        setTriggerImport(true);
        localStorage.removeItem('triggerImport');
      }
    }
  }, []);

  const handleExport = async () => {
    if (!dbs.filament) return;
    setIsSpinning(true);
    setStatus(null);
    try {
      await exportDB(dbs.filament);
    } catch (error) {
      console.error('Failed to export', error);
      setStatus({
        type: 'error',
        message: 'Failed to export the database. See console for details.',
      });
    } finally {
      setIsSpinning(false);
    }
  };

  const handleJsonFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
      setStatus(null);
    } else {
      setSelectedFile(null);
      if (file)
        setStatus({ type: 'error', message: 'Invalid file type. Please select a JSON file.' });
    }
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setCsvFile(file);
      setShowCsvModal(true);
      event.target.value = '';
    } else if (file) {
      setStatus({ type: 'error', message: 'Invalid file type. Please select a CSV file.' });
    }
  };

  const handleJsonImport = useCallback(async () => {
    if (!dbs.filament || !selectedFile) return;

    setIsSpinning(true);
    setStatus(null);

    try {
      if (clearBeforeImport) {
        if (
          !window.confirm(
            'Are you sure you want to clear the filament database? This action cannot be undone.'
          )
        ) {
          setIsSpinning(false);
          return;
        }
        const fileContent = await selectedFile.text();
        const fileData = { name: selectedFile.name, type: selectedFile.type, content: fileContent };
        localStorage.setItem('selectedFile', JSON.stringify(fileData));
        localStorage.setItem('clearDatabase', 'true');
        localStorage.setItem('triggerImport', 'true');
        window.location.reload();
        return;
      }

      const data = await selectedFile.text();
      const jsonData = JSON.parse(data);
      await importDB(dbs.filament, jsonData);
      setStatus({ type: 'success', message: 'Data imported successfully!' });
    } catch (error) {
      console.error('Import error:', error);
      setStatus({
        type: 'error',
        message: `Error importing data: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      setIsSpinning(false);
    }
  }, [dbs.filament, selectedFile, clearBeforeImport]);

  const handleCsvSave = async (data: Filament[]) => {
    if (!dbs.filament) return;
    try {
      const result = await dbs.filament.bulkDocs(data);
      const successCount = result.filter((r) => 'ok' in r).length;
      setStatus({
        type: 'success',
        message: `Successfully imported ${successCount} spools from CSV.`,
      });

      scrollToTop();
    } catch (error) {
      console.error('CSV Import Error', error);
      setStatus({ type: 'error', message: 'Failed to save CSV data to database.' });
    }
  };

  const handleEmptyDatabase = async () => {
    if (!dbs.filament) return;

    const firstConfirm = window.confirm(
      '⚠ WARNING: This will permanently delete ALL filaments and usage logs from your local database.\n\nAre you sure you want to proceed?'
    );

    if (!firstConfirm) return;

    const secondConfirm = window.confirm(
      'Are you absolutely sure? We highly recommend exporting a JSON backup first. This action cannot be undone.'
    );

    if (!secondConfirm) return;

    setIsDeletingAll(true);
    setStatus(null);

    try {
      const allDocs = await dbs.filament.allDocs();
      const docsToDelete = allDocs.rows.map((row) => ({
        _id: row.id,
        _rev: row.value.rev,
        _deleted: true,
      }));

      await dbs.filament.bulkDocs(docsToDelete);

      setStatus({
        type: 'success',
        message: 'Database successfully emptied. All filaments have been removed.',
      });
      scrollToTop();
    } catch (error) {
      console.error('Failed to empty database:', error);
      setStatus({
        type: 'error',
        message: 'Failed to empty database. Please see console for details.',
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  useEffect(() => {
    if (triggerImport && dbs.filament && selectedFile) {
      handleJsonImport();
    }
  }, [triggerImport, dbs.filament, selectedFile, handleJsonImport]);

  if (!isReady) {
    return (
      <div className='text-center p-4'>
        <Spinner animation='border' variant='primary' />
      </div>
    );
  }

  return (
    <div className={styles.settingsPane} ref={topRef}>
      {status && (
        <Alert variant={status.type} onClose={() => setStatus(null)} dismissible>
          {status.message}
        </Alert>
      )}

      <div className={styles.ioSection}>
        <h5 className={styles.paneSubtitle}>Export Database</h5>
        <p className='text-muted'>Download a JSON backup of your entire filament inventory.</p>
        <Button
          variant='outline-primary'
          disabled={isSpinning || isDeletingAll}
          onClick={handleExport}
          className={styles.settingsButton}>
          <FontAwesomeIcon icon={faFileExport} className='me-2' />
          {isSpinning ? 'Exporting...' : 'Export Data'}
        </Button>
      </div>

      <hr className='my-4' />

      <div className={styles.ioSection}>
        <h5 className={styles.paneSubtitle}>Import Database (JSON Backup)</h5>
        <p className='text-muted'>Restore your data from a FilaMeter JSON backup.</p>
        <Form>
          <Form.Group controlId='formFile' className='mb-3'>
            <Form.Control type='file' accept='.json' onChange={handleJsonFileChange} />
          </Form.Group>
          <Form.Group className='mb-3'>
            <Form.Check
              type='checkbox'
              id='clearBeforeImport'
              label='Clear existing database before import'
              className={styles.settingsCheckbox}
              checked={clearBeforeImport}
              onChange={(e) => setClearBeforeImport(e.target.checked)}
            />
          </Form.Group>
          <Button
            variant='primary'
            onClick={handleJsonImport}
            disabled={!selectedFile || isSpinning || isDeletingAll}
            className={styles.settingsButton}>
            <FontAwesomeIcon icon={faFileImport} className='me-2' />
            {isSpinning ? 'Importing...' : 'Import Backup'}
          </Button>
        </Form>
      </div>

      <hr className='my-4' />

      <div className={styles.ioSection}>
        <h5 className={styles.paneSubtitle}>Import from CSV</h5>
        <p className='text-muted'>
          Import data from Excel or other software. Upload a CSV and map columns to FilaMeter
          fields.
        </p>
        <Form>
          <div className='d-flex align-items-center gap-3'>
            <Button
              variant='outline-secondary'
              className={styles.settingsButton}
              disabled={isSpinning || isDeletingAll}
              onClick={() => document.getElementById('csvFileInput')?.click()}>
              <FontAwesomeIcon icon={faFileCsv} className='me-2' />
              Upload CSV
            </Button>
            <Form.Control
              id='csvFileInput'
              type='file'
              accept='.csv'
              onChange={handleCsvFileChange}
              style={{ display: 'none' }}
            />
            {csvFile && <span className='text-success small'>Selected: {csvFile.name}</span>}
          </div>
        </Form>
      </div>

      <hr className='my-5' />

      <div className={`${styles.ioSection} border border-danger rounded p-4 bg-white shadow-sm`}>
        <h5 className='text-danger mb-3 fw-bold'>
          <FontAwesomeIcon icon={faExclamationTriangle} className='me-2' />
          Danger Zone
        </h5>
        <p className='text-muted mb-4'>
          Permanently delete all filaments and usage history from your local database. This action
          cannot be undone unless you have a backup.
        </p>
        <Button
          variant='outline-danger'
          onClick={handleEmptyDatabase}
          disabled={isSpinning || isDeletingAll}>
          <FontAwesomeIcon icon={faTrash} className='me-2' />
          {isDeletingAll ? 'Deleting Database...' : 'Empty Spool Library'}
        </Button>
      </div>

      <CsvMappingModal
        show={showCsvModal}
        file={csvFile}
        onClose={() => setShowCsvModal(false)}
        onSave={handleCsvSave}
      />
    </div>
  );
}
