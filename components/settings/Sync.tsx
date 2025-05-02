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
import type { Filament } from '@/types/Filament';

interface SyncDataStructure {
  local: Filament[];
  regular: Filament[];
}
interface SyncProps {
  verifyKey: string;
}

const defaultSyncData: SyncDataStructure = { local: [], regular: [] };

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
  const [dbExport, setDbExport] = useState(defaultSyncData);
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
          const exportData = (await exportDB(dbs.filament, false)) ?? defaultSyncData;
          setDbExport(exportData as SyncDataStructure);
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
          lastSynced: null,
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

  const pushSyncData = async (force = false) => {
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
    if (!data?.syncKey) {
      setAlertVariant('warning');
      setAlertMessage('Sync key missing');
      setShowAlert(true);
      return;
    }

    try {
      setIsSpinning(true);
      const response = await checkTimestamp(data.syncKey);
      if (response.status === 'success') {
        // Ensure both timestamp values exist before attempting comparison
        if (response.timestamp) {
          const responseDate = new Date(response.timestamp);
          const lastSyncedDate = new Date(data?.lastSynced ?? 0);

          // Check if dates are valid after parsing
          if (isNaN(responseDate.getTime()) || isNaN(lastSyncedDate.getTime())) {
            console.error('Invalid date format encountered for comparison:', {
              responseTimestamp: response.timestamp,
              lastSynced: data.lastSynced,
            });
            // Set an appropriate error message if dates are invalid
            setAlertVariant('danger');
            setAlertMessage('Error comparing sync times: Invalid date format.');
          } else {
            // Perform the comparison: Is responseDate later than lastSyncedDate?
            if (responseDate > lastSyncedDate) {
              console.debug(
                `Update available. Last sync: ${lastSyncedDate.toLocaleString()}, Remote timestamp: ${responseDate.toLocaleString()}`
              );

              pullSyncData();
            } else {
              // TODO: Add specific logic if local data is up-to-date or newer
              setAlertVariant('success');
              setAlertMessage(
                `Data is up-to-date. Last sync: ${lastSyncedDate.toLocaleString()}, Remote timestamp: ${responseDate.toLocaleString()}`
              );
              setShowAlert(true);
            }
          }
        } else {
          // Handle cases where one of the timestamps might be missing even on success
          console.warn('Timestamp missing in successful response or local data:', {
            responseTimestamp: response.timestamp,
            lastSynced: data.lastSynced,
          });
          setAlertVariant('warning');
          setAlertMessage('Could not compare sync times: timestamp missing.');
          setShowAlert(true);
        }
      } else if (response.status === 'error') {
        setAlertVariant('danger');
        setAlertMessage(response.error);
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Failed to export', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Sync Failed!');
    }
    setIsSpinning(false);
  };

  const pullSyncData = async (force: boolean = false) => {
    if (!dbs?.filament) {
      console.error('Filament database is not initialized.');
      setAlertMessage('Database not ready. Cannot save filaments.');
      setAlertVariant('warning');
      setShowAlert(true);
      return;
    }

    // Refresh dbExport state right before pull/merge operation
    const currentDbExport: SyncDataStructure = dbExport;

    try {
      setIsSpinning(true);
      const response = await pullData(data?.syncKey);

      if (response.status === 'success') {
        const nowISO = new Date().toISOString();
        // Update settings data immediately after successful pull API call
        const updatedSettingsData = {
          ...data,
          syncKey: response.data?.token ?? data?.syncKey,
          email: response.data?.userData?.email ?? data?.email,
          accountType: response.data?.keyType ?? data?.accountType,
          lastSynced: nowISO,
          needsVerification: false,
        };
        setData(updatedSettingsData); // Update component state
        await save({ 'scl-sync': updatedSettingsData }); // Save updated settings to DB
        setLastSyncTime(Date.parse(nowISO)); // Update lastSyncTime for cooldown timer

        // Ensure serverData has the expected structure, provide defaults if not
        const serverData: SyncDataStructure = {
          local: response.data?.data?.local ?? [],
          regular: response.data?.data?.regular ?? [],
        };

        if (serverData.local.length > 0 || serverData.regular.length > 0) {
          let finalDataToImport: SyncDataStructure;
          let importMessage = '';

          if (force) {
            finalDataToImport = serverData;
            importMessage = 'Data has been force-pulled from the cloud, overwriting local data!';
            setAlertVariant('warning');
          } else {
            // Handle 'local' data: Always replace with server data
            const mergedLocal = serverData.local;

            // Handle 'regular' data: Merge based on _id
            const serverRegularMap = new Map(serverData.regular.map((item) => [item._id, item]));
            const mergedRegular: Filament[] = [];
            const processedServerIds = new Set<string>();

            // Iterate through local data
            if (currentDbExport.regular && Array.isArray(currentDbExport.regular)) {
              for (const localItem of currentDbExport.regular) {
                if (localItem?._id && serverRegularMap.has(localItem._id)) {
                  // ID exists in both: take server version
                  mergedRegular.push(serverRegularMap.get(localItem._id)!);
                  processedServerIds.add(localItem._id); // Mark server item as processed
                } else {
                  // ID only exists locally: keep local version
                  mergedRegular.push(localItem);
                }
              }
            }

            // Add any server items that were not present locally
            for (const serverItem of serverData.regular) {
              if (!processedServerIds.has(serverItem._id ?? '')) {
                mergedRegular.push(serverItem);
              }
            }

            finalDataToImport = { local: mergedLocal, regular: mergedRegular };
            importMessage = 'Data has been pulled and merged with local data!';
            setAlertVariant('success');
          }

          //Push new synced data to cloud
          const pushResponse = await pushData(data.syncKey, finalDataToImport);
          if (pushResponse.status === 'error') {
            setShowAlert(true);
            setAlertVariant('danger');
            setAlertMessage(response.error);
            return;
          }
          // Import the final data structure (either forced or merged)
          await importDB(dbs.filament, finalDataToImport);
          setAlertMessage(importMessage);

          // Refresh local export state *after* successful import
          try {
            const refreshedExportData = (await exportDB(dbs.filament, false)) ?? {
              local: [],
              regular: [],
            };
            setDbExport(refreshedExportData as SyncDataStructure);
          } catch (err) {
            console.error('Error refreshing local DB export after import:', err);
            // Non-critical error, maybe just log it
          }
        } else {
          setAlertVariant('info');
          setAlertMessage('Cloud data was empty. Local data remains unchanged.');
        }
      } else if (response.status === 'error') {
        setAlertVariant('danger');
        setAlertMessage(response.error);
      }
      setShowAlert(true); // Show alert for success/info/error cases
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
              <Col xs='auto'>
                Last Synced: {data?.lastSynced ? new Date(data.lastSynced).toLocaleString() : 'N/A'}
              </Col>
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
                    checkSyncTimestamp();
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
                    pushSyncData(true);
                  }}>
                  Force Push
                </Button>
              </Col>
              <Col xs='auto'>
                <Button
                  variant='info'
                  className='w-100'
                  disabled={isSpinning || initialType === 'needs-verification'}
                  onClick={() => {
                    pullSyncData(true);
                  }}>
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
