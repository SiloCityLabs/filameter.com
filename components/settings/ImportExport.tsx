import { useCallback, useState, useEffect } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
//DB
import { useDatabase } from '@/contexts/DatabaseContext';
import { exportDB } from '@/helpers/exportDB';
import { importDB } from '@/helpers/importDB';

export default function ImportExport() {
  const { dbs, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [clearBeforeImport, setClearBeforeImport] = useState(false);
  const [triggerImport, setTriggerImport] = useState(false);

  // Load selectedFile from localStorage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('selectedFile')) {
      const fileData = JSON.parse(localStorage.getItem('selectedFile')!);
      const file = new File([new Blob([fileData.content])], fileData.name, { type: fileData.type });

      //check for triggerImport
      const shouldTriggerImport = localStorage.getItem('triggerImport') === 'true';

      setSelectedFile(file);
      localStorage.removeItem('selectedFile');
      if (shouldTriggerImport) {
        setTriggerImport(true);
        localStorage.removeItem('triggerImport');
      }
    }
  }, []);

  const exportDatabase = async () => {
    if (!dbs.filament) return;
    setIsSpinning(true);
    setExportError(null);
    try {
      await exportDB(dbs.filament);
    } catch (error) {
      console.error('Failed to export', error);
      setExportError('Failed to export the database. See console for details.');
    } finally {
      setIsSpinning(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/json') {
        setSelectedFile(file);
        setImportStatus(null); // Reset import status
        setImportMessage(null); // Clear any previous message
      } else {
        setSelectedFile(null);
        setImportStatus('error');
        setImportMessage('Invalid file type. Please select a JSON file.');
      }
    } else {
      setSelectedFile(null);
      setImportStatus(null);
      setImportMessage(null);
    }
  };

  const handleImport = useCallback(async () => {
    if (!dbs.filament || !selectedFile) {
      return;
    }

    setIsSpinning(true);
    setImportStatus(null);
    setImportMessage(null);

    try {
      if (clearBeforeImport) {
        if (!window.confirm('Are you sure you want to clear the filament database?')) {
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

      if (
        typeof jsonData === 'object' &&
        jsonData !== null &&
        Array.isArray(jsonData.regular) &&
        Array.isArray(jsonData.local)
      ) {
        await importDB(dbs.filament, jsonData);
        setImportStatus('success');
        setImportMessage('Data imported successfully!');
      } else {
        setImportStatus('error');
        setImportMessage(
          "Invalid JSON format. Expected an object with 'regular' and 'local' arrays."
        );
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportStatus('error');
      setImportMessage(
        'Error importing data: ' + (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsSpinning(false);
    }
  }, [dbs.filament, selectedFile, clearBeforeImport]);

  useEffect(() => {
    if (triggerImport && dbs.filament && selectedFile) {
      handleImport();
    }
  }, [triggerImport, dbs.filament, selectedFile, handleImport]);

  if (!isReady) {
    return <div className='text-center'>Loading database...</div>;
  }

  return (
    <Row>
      <Col>
        <Row className='justify-content-center'>
          <Col xs={12} sm={6} md={3}>
            <div className='d-flex justify-content-center'>
              <Button
                variant='primary'
                className='w-100'
                disabled={isSpinning}
                onClick={exportDatabase}>
                Export Database
              </Button>
              {exportError && <p className='text-danger'>{exportError}</p>}
            </div>
          </Col>
        </Row>
        <hr />
        <Row>
          <Col>
            <Form>
              <Form.Group controlId='formFile' className='mb-3 text-center'>
                <Form.Label>Import JSON Database</Form.Label>
                <Form.Control type='file' accept='.json' onChange={handleFileChange} />
              </Form.Group>

              <Form.Group className='my-3'>
                <Form.Check
                  type='checkbox'
                  id='clearBeforeImport'
                  label='Clear database before import'
                  className='custom-checkbox'
                  checked={clearBeforeImport}
                  onChange={(e) => setClearBeforeImport(e.target.checked)}
                />
              </Form.Group>
              <Row className='justify-content-center'>
                <Col xs={12} sm={6} md={3}>
                  <div className='d-flex justify-content-center'>
                    <Button
                      variant='primary'
                      onClick={handleImport}
                      className='w-100'
                      disabled={!selectedFile || isSpinning}>
                      Import Data
                    </Button>
                  </div>
                </Col>
              </Row>

              {importMessage && (
                <p
                  className={importStatus === 'success' ? 'text-success mt-2' : 'text-danger mt-2'}>
                  {importMessage}
                </p>
              )}
            </Form>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
