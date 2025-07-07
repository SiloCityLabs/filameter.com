// --- React ---
import { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
// --- DB ---
import getAllSettings from '@/helpers/database/settings/getAllSettings';
import saveSettings from '@/helpers/database/settings/saveSettings';
import { useDatabase } from '@/contexts/DatabaseContext';
// --- Types ---
import type { sclSettings } from '@silocitypages/ui-core';

const tableHeaders = [
  'ID',
  'Filament',
  'Material',
  'Used (g)',
  'Total (g)',
  'Remaining (g)',
  'Location',
  'Comments',
];

/**
 * Renders the main settings panel, allowing users to configure
 * which columns are visible on the spools table.
 */
export default function MainSettings() {
  const { dbs, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<sclSettings>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (dbs.settings) {
        try {
          // Cast the fetched settings to sclSettings, which allows for indexable properties.
          const allData = (await getAllSettings(dbs.settings)) as sclSettings;

          // If spoolHeaders setting doesn't exist or is not an object, initialize it.
          if (!allData.spoolHeaders || typeof allData.spoolHeaders !== 'object') {
            allData.spoolHeaders = {};
            tableHeaders.forEach((header) => {
              // This is now valid because allData.spoolHeaders is treated as an indexable object.
              allData.spoolHeaders[header] = true;
            });
          }
          setData(allData);
        } catch (err: unknown) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings.';
          setAlertMessage(errorMessage);
          setShowAlert(true);
          setAlertVariant('danger');
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (isReady) {
      fetchData();
    }
  }, [dbs, isReady]);

  const handleCheckboxChange = (header: string, isChecked: boolean) => {
    setData((prevData) => {
      const newData = { ...prevData };
      // Ensure spoolHeaders is initialized before modification
      if (!newData.spoolHeaders || typeof newData.spoolHeaders !== 'object') {
        newData.spoolHeaders = {};
      }
      newData.spoolHeaders[header] = isChecked;
      return newData;
    });
  };

  const save = async () => {
    if (!dbs.settings) {
      console.error('Database is not initialized.');
      return;
    }

    setIsSpinning(true);

    try {
      await saveSettings(dbs.settings, data);
      setAlertMessage('Settings Saved!');
      setAlertVariant('success');
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      if (error instanceof Error) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage('An unknown error occurred while saving settings.');
      }
      setAlertVariant('danger');
    } finally {
      setIsSpinning(false);
      setShowAlert(true);
    }
  };

  if (!isReady || isLoading) {
    return <div className='text-center'>Loading database...</div>;
  }

  return (
    <Row>
      <Col>
        <CustomAlert
          variant={alertVariant ? alertVariant : 'success'}
          message={alertMessage}
          show={showAlert}
          onClose={() => setShowAlert(false)}
        />
        <h4 className='text-center'>Spools: Show/Hide Columns</h4>
        <hr />
        <Row className='justify-content-center'>
          <Col className='d-flex flex-wrap justify-content-center'>
            {tableHeaders.map((header) => (
              <div
                key={header}
                className='d-flex'
                style={{ width: '50%', maxWidth: '200px', padding: '0.5rem' }}>
                <Form.Check
                  type='checkbox'
                  id={`checkbox-${header.replace(/\s/g, '')}`}
                  label={header}
                  className='me-2 custom-checkbox'
                  checked={data?.spoolHeaders?.[header] || false}
                  onChange={(e) => handleCheckboxChange(header, e.target.checked)}
                />
              </div>
            ))}
          </Col>
        </Row>
        <Row className='mt-5 justify-content-center'>
          <Col xs={12} sm={6} md={3}>
            <div className='d-flex justify-content-center'>
              <Button variant='primary' className='w-100' disabled={isSpinning} onClick={save}>
                Save Settings
              </Button>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
