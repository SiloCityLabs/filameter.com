import { useState, useEffect } from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
// --- Components ---
import CustomAlert from '@/components/_silabs/bootstrap/CustomAlert';
// --- Helpers ---
import { isValidEmail } from '@/helpers/isValidEmail';
import { setupSyncByEmail } from '@/helpers/sync/setupSyncByEmail';
import { setupSyncByKey } from '@/helpers/sync/setupSyncByKey';
import { pushData } from '@/helpers/sync/pushData';
import { pullData } from '@/helpers/sync/pullData';
import { checkTimestamp } from '@/helpers/sync/checkTimestamp';
// --- DB ---
import getDocumentByColumn from '@/helpers/_silabs/pouchDb/getDocumentByColumn';
import saveSettings from '@/helpers/database/settings/saveSettings';
import { useDatabase } from '@/contexts/DatabaseContext';
import { exportDB } from '@/helpers/exportDB';
import { importDB } from '@/helpers/importDB';
// --- Types ---
import type { sclSettings } from '@/types/_fw';

interface SyncProps {
  verifyKey: string;
}

export default function Sync({ verifyKey }: SyncProps) {
  const { dbs, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<sclSettings>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [initialType, setInitialType] = useState('');
  const [syncEmail, setSyncEmail] = useState('');
  const [syncKey, setSyncKey] = useState('');
  const [dbExport, setDbExport] = useState({});
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncCooldown, setSyncCooldown] = useState<number>(0);

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  useEffect(() => {
    async function fetchData() {
      if (dbs.settings && dbs.filament) {
        try {
          setIsLoading(true);

          //Get Sync Data
          const sclSync = await getDocumentByColumn(dbs.settings, 'name', 'scl-sync', 'settings');

          if (sclSync && sclSync.value !== '') {
            const syncData = JSON.parse(sclSync.value);
            setData(syncData);

            console.log('Sync data:', syncData);

            if (syncData.syncKey === '' || syncData.needsVerification) {
              //Setup sync via key verification
              if (verifyKey) {
                existingKey(verifyKey);
              } else {
                setInitialType('needs-verification');
                setAlertVariant('info');
                setAlertMessage('Check your email for a verification code');
                setShowAlert(true);
              }
            } else {
              setInitialType('engaged');
            }
          } else if (verifyKey) {
            existingKey(verifyKey);
          }

          //Get Filament Export Data
          const exportData = (await exportDB(dbs.filament, false)) ?? {};
          setDbExport(exportData);
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

  const canSync = () => {
    if (!lastSyncTime) return true;
    const now = Date.now();
    return now - lastSyncTime >= 60000; // 60 seconds
  };

  const save = async (saveData: sclSettings) => {
    if (!dbs?.settings) {
      console.error('Settings database is not initialized.');
      setAlertMessage('Database not ready. Cannot save settings.');
      setAlertVariant('warning');
      setShowAlert(true);
      return;
    }

    setIsSpinning(true);

    try {
      await saveSettings(dbs.settings, saveData);
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      if (error instanceof Error) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage('An unknown error occurred while saving settings.');
      }
      setShowAlert(true);
      setAlertVariant('danger');
    } finally {
      setIsSpinning(false);
    }
  };

  const createSync = async () => {
    if (!isValidEmail(syncEmail)) {
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Invalid Email!');
      return;
    }

    try {
      setIsSpinning(true);
      const response = await setupSyncByEmail(syncEmail);
      if (response.status === 'message') {
        data.email = syncEmail;
        data.needsVerification = true;
        setData(data);
        save({ 'scl-sync': data });
        setInitialType('needs-verification');
        setAlertVariant('info');
        setAlertMessage(response.msg);
      } else if (response.status === 'error') {
        setAlertVariant('danger');
        setAlertMessage(response.error);
      }
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to export', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Sync Failed!');
    }
    setIsSpinning(false);
  };

  const existingKey = async (key: string = '') => {
    if (!syncKey && !key) {
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Key is required!');
      return;
    }

    const userKey = key || syncKey;

    try {
      setIsSpinning(true);
      const response = await setupSyncByKey(userKey);
      if (response.status === 'success' && response.data) {
        const keyData = {
          syncKey: response.data.token,
          email: response.data.userData.email,
          accountType: response.data.keyType,
          lastSynced: new Date().toISOString(),
        };
        setData(keyData);
        await save({ 'scl-sync': keyData });
        setInitialType('engaged');
        setAlertVariant('success');
        setAlertMessage('Sync setup with key!');
      } else if (response.status === 'error') {
        setShowAlert(true);
        setAlertVariant('danger');
        setAlertMessage(response.error);
      }
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to setup sync with key:', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Sync Failed!');
    }
    setIsSpinning(false);
  };

  const syncData = async (force = false) => {
    if (!force && !canSync()) {
      setAlertVariant('warning');
      setAlertMessage('Please wait 60 seconds between syncs');
      setShowAlert(true);
      return;
    }

    try {
      setIsSpinning(true);
      const response = await pushData(data?.syncKey, dbExport);
      if (response.status === 'success') {
        // Update lastSynced but preserve other data
        const updatedData = { ...data, lastSynced: new Date().toISOString() };
        setData(updatedData);
        await save({ 'scl-sync': updatedData });
        setLastSyncTime(Date.now());
        setSyncCooldown(60);
        setAlertVariant('success');
        setAlertMessage('Data has been synced to the cloud!');
      } else if (response.status === 'error') {
        setShowAlert(true);
        setAlertVariant('danger');
        setAlertMessage(response.error);
      }
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to export', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Sync Failed!');
    }
    setIsSpinning(false);
  };

  const checkSyncTimestamp = async () => {
    if (data?.syncKey) {
      setAlertVariant('warning');
      setAlertMessage('Sync key missing');
      setShowAlert(true);
      return;
    }

    try {
      setIsSpinning(true);
      const response = await checkTimestamp(data.syncKey);
      console.log('checkTimestamp response', response);
      // if (response.status === 'success') {
      // } else if (response.status === 'error') {
      //   setShowAlert(true);
      //   setAlertVariant('danger');
      //   setAlertMessage(response.error);
      // }
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to export', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Sync Failed!');
    }
    setIsSpinning(false);
  };

  const forcePull = async () => {
    if (!dbs?.filament) {
      console.error('Filament database is not initialized.');
      setAlertMessage('Database not ready. Cannot save filaments.');
      setAlertVariant('warning');
      setShowAlert(true);
      return;
    }

    try {
      setIsSpinning(true);
      const response = await pullData(data?.syncKey);
      if (response.status === 'success') {
        // Update lastSynced but preserve other data
        const updatedData = {
          ...data,
          syncKey: response.data.token,
          email: response.data.userData.email,
          accountType: response.data.keyType,
          lastSynced: new Date().toISOString(),
        };
        setData(updatedData);
        await save({ 'scl-sync': updatedData });

        // Force overwrite data
        if (Object.keys(response.data?.data).length > 0 && response.data.data?.regular) {
          await importDB(dbs.filament, response.data.data);
          setAlertVariant('success');
          setAlertMessage('Data has been pulled from the cloud!');
        } else {
          setAlertVariant('info');
          setAlertMessage('There was no cloud data, nothing has been pulled from the cloud!');
        }
      } else if (response.status === 'error') {
        setShowAlert(true);
        setAlertVariant('danger');
        setAlertMessage(response.error);
      }
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to pull', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Pull Failed!');
    }
    setIsSpinning(false);
  };

  const removeSync = async () => {
    if (!window.confirm('Are you sure you want to remove your sync?')) {
      return;
    }

    setInitialType('');
    setData({});
    save({ 'scl-sync': '' });
    setAlertMessage('Sync Removed');
    setShowAlert(true);
    setAlertVariant('info');
    return;
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
        {initialType === '' && (
          <Row className='justify-content-center align-items-center'>
            <Col xs='auto'>
              <Button
                variant='primary'
                className='w-100'
                disabled={isSpinning}
                onClick={() => setInitialType('setupEmail')}>
                Setup Sync
              </Button>
            </Col>
            <Col xs='auto' className='text-center'>
              OR
            </Col>
            <Col xs='auto'>
              <Button
                variant='primary'
                className='w-100'
                disabled={isSpinning}
                onClick={() => setInitialType('setupKey')}>
                Use Existing Key
              </Button>
            </Col>
          </Row>
        )}
        {initialType === 'setupEmail' && (
          <Row className='justify-content-center align-items-center'>
            <Col xs={12} md={6}>
              <Form.Group controlId='syncEmail'>
                <Form.Label>Sync Email</Form.Label>
                <Form.Control
                  type='email'
                  placeholder='Enter sync email'
                  value={syncEmail}
                  onChange={handleInputChange(setSyncEmail)}
                  disabled={isSpinning}
                  required
                />
              </Form.Group>
            </Col>
            <Row className='justify-content-center align-items-center mt-3'>
              <Col xs='auto'>
                <Button
                  variant='primary'
                  className='w-100'
                  disabled={isSpinning}
                  onClick={() => setInitialType('')}>
                  Cancel
                </Button>
              </Col>
              <Col xs='auto'>
                <Button
                  variant='primary'
                  className='w-100'
                  disabled={isSpinning}
                  onClick={async () => {
                    await createSync();
                  }}>
                  Finish Setup
                </Button>
              </Col>
            </Row>
          </Row>
        )}
        {initialType === 'setupKey' && (
          <Row className='justify-content-center align-items-center'>
            <Col xs={12} md={6}>
              <Form.Group controlId='syncKey'>
                <Form.Label>Sync Key</Form.Label>
                <Form.Control
                  type='text'
                  placeholder='Enter sync key'
                  value={syncKey}
                  onChange={handleInputChange(setSyncKey)}
                  disabled={isSpinning}
                  required
                />
              </Form.Group>
            </Col>
            <Row className='justify-content-center align-items-center mt-3'>
              <Col xs='auto'>
                <Button
                  variant='primary'
                  className='w-100'
                  disabled={isSpinning}
                  onClick={() => setInitialType('')}>
                  Cancel
                </Button>
              </Col>
              <Col xs='auto'>
                <Button
                  variant='primary'
                  className='w-100'
                  disabled={isSpinning}
                  onClick={async () => {
                    await existingKey();
                  }}>
                  Finish Setup
                </Button>
              </Col>
            </Row>
          </Row>
        )}
        {(initialType === 'engaged' || initialType === 'needs-verification') && (
          <>
            <Row className='justify-content-center align-items-center'>
              <Col xs='auto'>Email: {data?.email ?? 'N/A'}</Col>
              <Col xs='auto'>Key: {data?.syncKey ?? 'N/A'}</Col>
              <Col xs='auto'>Last Synced: {data?.lastSynced ?? 'N/A'}</Col>
              <Col xs='auto'>Account Type: {data?.accountType || 'Free'}</Col>
            </Row>
            <Row className='mt-4 justify-content-center align-items-center'>
              <Col xs='auto'>
                <Button
                  variant='primary'
                  className='w-100'
                  disabled={isSpinning}
                  onClick={() => {
                    removeSync();
                  }}>
                  Remove Sync
                </Button>
              </Col>
              <Col xs='auto'>
                <Button
                  variant='primary'
                  className='w-100'
                  disabled={isSpinning || syncCooldown > 0 || initialType === 'needs-verification'}
                  onClick={() => {
                    syncData();
                  }}>
                  {syncCooldown > 0 ? `Sync (${syncCooldown}s)` : 'Sync Now'}
                </Button>
              </Col>
              <Col xs='auto'>
                <Button
                  variant='warning'
                  className='w-100'
                  disabled={isSpinning || initialType === 'needs-verification'}
                  onClick={() => {
                    syncData(true);
                  }}>
                  Force Push
                </Button>
              </Col>
              <Col xs='auto'>
                <Button
                  variant='info'
                  className='w-100'
                  disabled={isSpinning || initialType === 'needs-verification'}
                  onClick={forcePull}>
                  Force Pull
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Col>
    </Row>
  );
}
