'use client';

// --- React ---
import { useState, useEffect, useCallback, useRef } from 'react';
import { Form, Button, Spinner, Card } from 'react-bootstrap';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
// --- Helpers ---
import { isValidEmail } from '@/helpers/isValidEmail';
import { setupSyncByEmail } from '@/helpers/sync/setupSyncByEmail';
import { setupSyncByKey } from '@/helpers/sync/setupSyncByKey';
import { pushData } from '@/helpers/sync/pushData';
import { pullData } from '@/helpers/sync/pullData';
import { checkTimestamp } from '@/helpers/sync/checkTimestamp';
// --- DB ---
import { getDocumentByColumn } from '@silocitypages/data-access';
import saveSettings from '@/helpers/database/settings/saveSettings';
import { useDatabase } from '@/contexts/DatabaseContext';
import { exportDB } from '@/helpers/exportDB';
import { importDB } from '@/helpers/importDB';
// --- Types ---
import type { sclSettings } from '@silocitypages/ui-core';
import type { Filament } from '@/types/Filament';
import { ApiErrorResponse } from '@/types/api';
// --- Styles ---
import styles from '@/public/styles/components/Settings.module.css';

interface SyncDataStructure {
  local: Filament[];
  regular: Filament[];
}
interface SyncProps {
  verifyKey: string;
}

type SyncInitialType =
  | 'loading'
  | 'needs-verification'
  | 'engaged'
  | 'setupEmail'
  | 'setupKey'
  | '';

const defaultSyncData: SyncDataStructure = { local: [], regular: [] };

export default function Sync({ verifyKey }: SyncProps) {
  const { dbs, isReady } = useDatabase();
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [data, setData] = useState<sclSettings>({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [initialType, setInitialType] = useState<SyncInitialType>('loading');
  const [syncEmail, setSyncEmail] = useState('');
  const [syncKey, setSyncKey] = useState('');
  const [dbExport, setDbExport] = useState<SyncDataStructure>(defaultSyncData);
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [syncCooldown, setSyncCooldown] = useState<number>(0);

  const dataRef = useRef(data);
  dataRef.current = data;

  const handleInputChange =
    (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  const save = useCallback(
    async (saveData: sclSettings) => {
      if (!dbs?.settings) {
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
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        setAlertMessage(message);
        setShowAlert(true);
        setAlertVariant('danger');
      } finally {
        setIsSpinning(false);
      }
    },
    [dbs]
  );

  const canSync = useCallback(() => {
    if (!lastSyncTime) return true;
    return Date.now() - lastSyncTime >= 60000;
  }, [lastSyncTime]);

  const pushSyncData = useCallback(
    async (force = false, syncData?: sclSettings, dataToPush: SyncDataStructure = dbExport) => {
      const dataToUse = syncData || dataRef.current;
      if (!dataToUse?.syncKey) {
        return;
      }
      if (!force && !canSync()) {
        setAlertVariant('warning');
        setAlertMessage('Please wait 60 seconds between syncs');
        setShowAlert(true);
        return;
      }
      try {
        setIsSpinning(true);
        const response = await pushData(dataToUse.syncKey, dataToPush);
        if (response.status === 'success') {
          const updatedData = { ...dataToUse, lastSynced: new Date().toISOString() };
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
    },
    [dbExport, save, canSync]
  );

  const pullSyncData = useCallback(
    async (force = false) => {
      if (!dbs?.filament || !data?.syncKey) {
        setAlertMessage('Database not ready or sync key missing.');
        setAlertVariant('warning');
        setShowAlert(true);
        return;
      }
      try {
        setIsSpinning(true);
        const response = await pullData(data.syncKey);
        if (response.status === 'success') {
          console.log('Pull response:', response);
          const nowISO = new Date().toISOString();
          const updatedSettingsData = {
            ...data,
            syncKey: response.data?.token ?? data.syncKey,
            email: (response.data?.userData as { email?: string })?.email ?? data.email,
            accountType: response.data?.keyType ?? data.accountType,
            lastSynced: nowISO,
            needsVerification: false,
          };
          setData(updatedSettingsData);
          await save({ 'scl-sync': updatedSettingsData });
          setLastSyncTime(Date.parse(nowISO));
          const serverData: SyncDataStructure = {
            local: (response.data?.data?.local as Filament[]) ?? [],
            regular: (response.data?.data?.regular as Filament[]) ?? [],
          };
          if (serverData.local.length > 0 || serverData.regular.length > 0) {
            let finalDataToImport: SyncDataStructure;
            let importMessage = '';
            if (force) {
              finalDataToImport = serverData;
              importMessage = 'Data has been force-pulled from the cloud, overwriting local data!';
              setAlertVariant('warning');
            } else {
              const serverRegularMap = new Map(serverData.regular.map((item) => [item._id, item]));
              const mergedRegular: Filament[] = [];
              const processedServerIds = new Set<string>();
              if (dbExport.regular && Array.isArray(dbExport.regular)) {
                for (const localItem of dbExport.regular) {
                  if (localItem?._id && serverRegularMap.has(localItem._id)) {
                    mergedRegular.push(serverRegularMap.get(localItem._id)!);
                    processedServerIds.add(localItem._id);
                  } else {
                    mergedRegular.push(localItem);
                  }
                }
              }
              for (const serverItem of serverData.regular) {
                if (!processedServerIds.has(serverItem._id ?? '')) {
                  mergedRegular.push(serverItem);
                }
              }
              finalDataToImport = { local: serverData.local, regular: mergedRegular };
              importMessage = 'Data has been pulled and merged with local data!';
              setAlertVariant('success');
            }
            const pushResponse = await pushData(data.syncKey, finalDataToImport);
            if (pushResponse.status === 'error') {
              setShowAlert(true);
              setAlertVariant('danger');
              setAlertMessage((pushResponse as ApiErrorResponse).error);
              return;
            }
            await importDB(dbs.filament, finalDataToImport);
            setAlertMessage(importMessage);
            const refreshedExportData = (await exportDB(dbs.filament, false)) ?? defaultSyncData;
            setDbExport(refreshedExportData as SyncDataStructure);
          } else {
            setAlertVariant('info');
            setAlertMessage('Cloud data was empty. Local data remains unchanged.');
          }
        } else if (response.status === 'error') {
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
    },
    [dbs, data, dbExport, save, pushSyncData]
  );

  const existingKey = useCallback(
    async (key = '') => {
      const userKey = key || syncKey;
      if (!userKey) {
        setAlertMessage('Key is required!');
        setAlertVariant('danger');
        setShowAlert(true);
        return;
      }
      setIsSpinning(true);
      try {
        const response = await setupSyncByKey(userKey);
        if (response.status === 'success' && response.data) {
          const keyData = {
            syncKey: response.data.token,
            email: (response.data.userData as { email?: string })?.email ?? '',
            accountType: response.data.keyType,
            lastSynced: null,
            needsVerification: false,
          };
          setData(keyData);
          await save({ 'scl-sync': keyData });
          setInitialType('engaged');

          if (key && dbs.filament) {
            const initialDbExport = (await exportDB(dbs.filament, false)) ?? defaultSyncData;
            await pushSyncData(true, keyData, initialDbExport as SyncDataStructure);
            setAlertMessage('Sync successful! Your data has been pushed to the cloud.');
          } else {
            setAlertVariant('success');
            setAlertMessage('Sync setup with key!');
            setShowAlert(true);
          }
        } else if (response.status === 'error') {
          setAlertMessage(response.error);
          setAlertVariant('danger');
          setShowAlert(true);
        }
      } catch (error) {
        console.error('Failed to setup sync with key:', error);
        setAlertMessage('Sync Failed!');
        setAlertVariant('danger');
        setShowAlert(true);
      }
      setIsSpinning(false);
    },
    [syncKey, save, pushSyncData, dbs]
  );

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
        const newData = { ...data, email: syncEmail, needsVerification: true };
        setData(newData);
        await save({ 'scl-sync': newData });
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

  const checkSyncTimestamp = useCallback(async () => {
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
        if (response.timestamp) {
          const responseDate = new Date(response.timestamp);
          const lastSyncedDate = new Date(data?.lastSynced ?? 0);
          if (isNaN(responseDate.getTime()) || isNaN(lastSyncedDate.getTime())) {
            setAlertVariant('danger');
            setAlertMessage('Error comparing sync times: Invalid date format.');
          } else {
            if (responseDate > lastSyncedDate) {
              await pullSyncData();
              setLastSyncTime(Date.now());
              setSyncCooldown(60);
            } else {
              setAlertVariant('success');
              setAlertMessage('Data is up-to-date.');
              setShowAlert(true);
            }
          }
        } else {
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
      console.error('Failed to check timestamp', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Timestamp Check Failed!');
    }
    setIsSpinning(false);
  }, [data, pullSyncData]);

  const removeSync = async () => {
    if (!window.confirm('Are you sure you want to remove your sync?')) {
      return;
    }
    setInitialType('');
    setData({});
    await save({ 'scl-sync': '' });
    setAlertMessage('Sync Removed');
    setShowAlert(true);
    setAlertVariant('info');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!dbs.settings || !dbs.filament) {
        return;
      }

      try {
        const sclSync = await getDocumentByColumn(dbs.settings, 'name', 'scl-sync', 'settings');
        if (sclSync && sclSync.value) {
          const syncData = JSON.parse(sclSync.value as string);
          setData(syncData);
          if (syncData.syncKey === '' || syncData.needsVerification) {
            if (verifyKey) {
              await existingKey(verifyKey);
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
          await existingKey(verifyKey);
        } else {
          setInitialType('');
        }
        const exportedData = (await exportDB(dbs.filament, false)) ?? defaultSyncData;
        setDbExport(exportedData as SyncDataStructure);
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch settings.';
        setAlertMessage(errorMessage);
        setShowAlert(true);
        setAlertVariant('danger');
        setInitialType('');
      } finally {
        setIsInitialLoad(false);
      }
    };

    if (isReady && isInitialLoad) {
      fetchData();
    } else if (!isReady) {
      setInitialType('loading');
    }
  }, [isReady, isInitialLoad, dbs, verifyKey, existingKey]);

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

  return (
    <div className={styles.settingsPane}>
      <CustomAlert
        variant={alertVariant || 'success'}
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      />

      {initialType === 'loading' && (
        <div className='text-center p-4'>
          <Spinner animation='border' variant='primary' />
        </div>
      )}

      {initialType === '' && (
        <div className='text-center'>
          <h5 className={styles.paneSubtitle}>Setup Cloud Sync</h5>
          <p className='text-muted'>Sync your data across devices securely.</p>
          <Button variant='primary' onClick={() => setInitialType('setupEmail')} className='me-2'>
            Setup with Email
          </Button>
          <Button variant='outline-secondary' onClick={() => setInitialType('setupKey')}>
            Use Existing Key
          </Button>
        </div>
      )}

      {initialType === 'setupEmail' && (
        <div>
          <h5 className={styles.paneSubtitle}>Setup with Email</h5>
          <Form.Group className='mb-3'>
            <Form.Label>Your Email Address</Form.Label>
            <Form.Control
              type='email'
              placeholder='Enter your email'
              value={syncEmail}
              onChange={handleInputChange(setSyncEmail)}
              disabled={isSpinning}
            />
          </Form.Group>
          <Button variant='primary' onClick={createSync} disabled={isSpinning}>
            {isSpinning ? <Spinner as='span' size='sm' /> : 'Finish Setup'}
          </Button>
          <Button variant='link' onClick={() => setInitialType('')} className='ms-2'>
            Cancel
          </Button>
        </div>
      )}

      {initialType === 'setupKey' && (
        <div>
          <h5 className={styles.paneSubtitle}>Setup with Existing Key</h5>
          <Form.Group className='mb-3'>
            <Form.Label>Your Sync Key</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter your sync key'
              value={syncKey}
              onChange={handleInputChange(setSyncKey)}
              disabled={isSpinning}
            />
          </Form.Group>
          <Button variant='primary' onClick={() => existingKey()} disabled={isSpinning}>
            {isSpinning ? <Spinner as='span' size='sm' /> : 'Finish Setup'}
          </Button>
          <Button variant='link' onClick={() => setInitialType('')} className='ms-2'>
            Cancel
          </Button>
        </div>
      )}

      {initialType === 'needs-verification' && (
        <div>
          <h5 className={styles.paneSubtitle}>Check Your Email</h5>
          <p className='text-muted'>
            We&apos;ve sent a verification key to <strong>{data.email}</strong>. Please enter it
            below.
          </p>
          <Form.Group className='mb-3'>
            <Form.Label>Verification Key</Form.Label>
            <Form.Control
              type='text'
              placeholder='Enter key from email'
              value={syncKey}
              onChange={handleInputChange(setSyncKey)}
            />
          </Form.Group>
          <Button variant='primary' onClick={() => existingKey()} disabled={isSpinning}>
            {isSpinning ? <Spinner as='span' size='sm' /> : 'Complete Setup'}
          </Button>
        </div>
      )}

      {initialType === 'engaged' && (
        <div>
          <h5 className={styles.paneSubtitle}>Sync Status</h5>
          <Card body className={styles.syncStatusCard}>
            <p>
              <strong>Email:</strong> {data.email}
            </p>
            <p>
              <strong>Status:</strong> <span className='text-success'>Active</span>
            </p>
            <p className='mb-0'>
              <strong>Last Synced:</strong>{' '}
              {data.lastSynced ? new Date(data.lastSynced).toLocaleString() : 'Never'}
            </p>
          </Card>
          <div className='mt-3 d-flex flex-wrap gap-2'>
            <Button
              variant='primary'
              onClick={checkSyncTimestamp}
              disabled={isSpinning || syncCooldown > 0}>
              {syncCooldown > 0 ? `Sync (${syncCooldown}s)` : 'Sync Now'}
            </Button>
            <Button
              variant='outline-warning'
              onClick={() => pushSyncData(true)}
              disabled={isSpinning}>
              Force Push
            </Button>
            <Button variant='outline-info' onClick={() => pullSyncData(true)} disabled={isSpinning}>
              Force Pull
            </Button>
            <Button
              variant='outline-danger'
              onClick={removeSync}
              disabled={isSpinning}
              className='ms-md-auto'>
              Remove Sync
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
