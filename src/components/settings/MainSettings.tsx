'use client';

// --- React ---
import { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Spinner } from 'react-bootstrap';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
// --- Helpers ---
import getAllSettings from '@/helpers/database/settings/getAllSettings';
import saveSettings from '@/helpers/database/settings/saveSettings';
// --- Contexts ---
import { useDatabase } from '@/contexts/DatabaseContext';
// --- Types ---
import type { sclSettings } from '@silocitypages/ui-core';
// --- Styles ---
import styles from '@/public/styles/components/Settings.module.css';

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

export default function MainSettings() {
  const { dbs, isReady } = useDatabase();
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<sclSettings>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    async function fetchData() {
      if (dbs.settings) {
        setIsLoading(true);
        try {
          const allData = (await getAllSettings(dbs.settings)) as sclSettings;
          if (!allData.spoolHeaders || typeof allData.spoolHeaders !== 'object') {
            allData.spoolHeaders = {};
            tableHeaders.forEach((header) => {
              allData.spoolHeaders[header] = true;
            });
          }
          setData(allData);
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings.';
          setAlertMessage(errorMessage);
          setAlertVariant('danger');
          setShowAlert(true);
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (isReady) fetchData();
  }, [dbs, isReady]);

  const handleCheckboxChange = (header: string, isChecked: boolean) => {
    setData((prevData) => ({
      ...prevData,
      spoolHeaders: { ...prevData.spoolHeaders, [header]: isChecked },
    }));
  };

  const handleSave = async () => {
    if (!dbs.settings) return;
    setIsSaving(true);
    try {
      await saveSettings(dbs.settings, data);
      setAlertMessage('Settings Saved!');
      setAlertVariant('success');
    } catch (error) {
      setAlertMessage(error instanceof Error ? error.message : 'An unknown error occurred.');
      setAlertVariant('danger');
    } finally {
      setShowAlert(true);
      setIsSaving(false);
    }
  };

  if (!isReady || isLoading) {
    return (
      <div className='text-center p-4'>
        <Spinner animation='border' variant='primary' />
      </div>
    );
  }

  return (
    <div className={styles.settingsPane}>
      <CustomAlert
        variant={alertVariant || 'success'}
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      />
      <h4 className={styles.paneTitle}>Spool Table Columns</h4>
      <p className='text-muted'>Choose which columns to display on the spools page.</p>
      <Row>
        {tableHeaders.map((header) => (
          <Col key={header} xs={6} sm={4} md={3} className='mb-3'>
            <Form.Check
              type='checkbox'
              id={`checkbox-${header.replace(/\s/g, '')}`}
              label={header}
              className={styles.settingsCheckbox}
              checked={data?.spoolHeaders?.[header] || false}
              onChange={(e) => handleCheckboxChange(header, e.target.checked)}
            />
          </Col>
        ))}
      </Row>
      <div className='mt-4 text-end'>
        <Button
          variant='primary'
          disabled={isSaving}
          onClick={handleSave}
          className={styles.settingsButton}>
          {isSaving ? (
            <Spinner as='span' animation='border' size='sm' role='status' aria-hidden='true' />
          ) : (
            'Save Settings'
          )}
        </Button>
      </div>
    </div>
  );
}
