'use client';

// --- React ---
import { useCallback, useState, useEffect } from 'react';
import { Button, Form, Spinner, Alert } from 'react-bootstrap';
// --- Context ---
import { useDatabase } from '@/contexts/DatabaseContext';
// --- Helpers ---
import { exportDB } from '@/helpers/exportDB';
import { importDB } from '@/helpers/importDB';
// --- Styles ---
import styles from '@/public/styles/components/Settings.module.css';
// --- FontAwesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileExport, faFileImport } from '@fortawesome/free-solid-svg-icons';

export default function ImportExport() {
  const { dbs, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [clearBeforeImport, setClearBeforeImport] = useState(false);
  const [triggerImport, setTriggerImport] = useState(false);

  // Load selectedFile from localStorage on component mount to handle page reload
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleImport = useCallback(async () => {
    if (!dbs.filament || !selectedFile) {
      return;
    }

    setIsSpinning(true);
    setStatus(null);

    try {
      // Correctly handle the clear-before-import logic using page reload
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
        return; // Return to prevent further execution until after reload
      }

      const data = await selectedFile.text();
      const jsonData = JSON.parse(data);

      // The importDB function should handle both cases (with and without clearing)
      await importDB(dbs.filament, jsonData);
      setStatus({ type: 'success', message: 'Data imported successfully!' });
    } catch (error) {
      console.error('Import error:', error);
      setStatus({
        type: 'error',
        message: `Error importing data: ${error instanceof Error ? error.message : String(error)}`,
      });
    } finally {
      // This will only be reached for non-reloading imports
      setIsSpinning(false);
    }
  }, [dbs.filament, selectedFile, clearBeforeImport]);

  // This effect runs after a page reload to trigger the import
  useEffect(() => {
    if (triggerImport && dbs.filament && selectedFile) {
      handleImport();
    }
  }, [triggerImport, dbs.filament, selectedFile, handleImport]);

  if (!isReady) {
    return (
      <div className='text-center p-4'>
        <Spinner animation='border' variant='primary' />
      </div>
    );
  }

  return (
    <div className={styles.settingsPane}>
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
          disabled={isSpinning}
          onClick={handleExport}
          className={styles.settingsButton}>
          <FontAwesomeIcon icon={faFileExport} className='me-2' />
          {isSpinning ? 'Exporting...' : 'Export Data'}
        </Button>
      </div>

      <hr className='my-4' />

      <div className={styles.ioSection}>
        <h5 className={styles.paneSubtitle}>Import Database</h5>
        <p className='text-muted'>Import a previously exported JSON file to restore your data.</p>
        <Form>
          <Form.Group controlId='formFile' className='mb-3'>
            <Form.Control type='file' accept='.json' onChange={handleFileChange} />
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
            onClick={handleImport}
            disabled={!selectedFile || isSpinning}
            className={styles.settingsButton}>
            <FontAwesomeIcon icon={faFileImport} className='me-2' />
            {isSpinning ? 'Importing...' : 'Import Data'}
          </Button>
        </Form>
      </div>
    </div>
  );
}
