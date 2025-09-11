'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { getDocumentByColumn } from '@silocitypages/data-access';
import saveSettings from '@/helpers/database/settings/saveSettings';
import { useDatabase } from '@/contexts/DatabaseContext';
import { exportDB } from '@/helpers/exportDB';
import { importDB } from '@/helpers/importDB';
import { isValidEmail } from '@/helpers/isValidEmail';
import { setupSyncByEmail } from '@/helpers/sync/setupSyncByEmail';
import { setupSyncByKey } from '@/helpers/sync/setupSyncByKey';
import { pushData } from '@/helpers/sync/pushData';
import { pullData } from '@/helpers/sync/pullData';
import { checkTimestamp } from '@/helpers/sync/checkTimestamp';
import { forgotSyncKey } from '@/helpers/sync/forgotSyncKey';
import { mergeSyncData } from '@/helpers/sync/mergeSyncData';
import type { sclSettings } from '@silocitypages/ui-core';
import type { Filament } from '@/types/Filament';

interface SyncDataStructure {
  local: Filament[];
  regular: Filament[];
}

export type SyncInitialType =
  | 'loading'
  | 'needs-verification'
  | 'engaged'
  | 'setupEmail'
  | 'setupKey'
  | 'forgotKey'
  | '';

const defaultSyncData: SyncDataStructure = { local: [], regular: [] };
const LAST_SYNC_TIMESTAMP_KEY = 'scl-last-sync-timestamp';
const LAST_MODIFIED_KEY = 'scl-last-modified';
const COOLDOWN_SECONDS = 5;

export const useSync = (verifyKey: string) => {
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
  const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);
  const [lastModified, setLastModified] = useState<string | null>(null);
  const [syncCooldown, setSyncCooldown] = useState<number>(0);

  const dataRef = useRef(data);
  dataRef.current = data;

  const handleInputChange =
    (setter: (value: string) => void) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setter(event.target.value);
    };

  const save = useCallback(
    async (saveData: sclSettings, dbKey = 'scl-sync') => {
      if (!dbs?.settings) {
        setAlertMessage('Database not ready. Cannot save settings.');
        setAlertVariant('warning');
        setShowAlert(true);
        return;
      }
      try {
        await saveSettings(dbs.settings, { [dbKey]: saveData });
      } catch (error: unknown) {
        console.error('Error saving settings:', error);
        const message = error instanceof Error ? error.message : 'An unknown error occurred.';
        setAlertMessage(message);
        setShowAlert(true);
        setAlertVariant('danger');
      }
    },
    [dbs]
  );

  const startCooldown = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, now.toString());
    setLastSyncTime(now);
  }, []);

  // New function to be called from other parts of the app on local DB changes
  const updateLastModified = useCallback(async () => {
    const nowISO = new Date().toISOString();
    setLastModified(nowISO);
    await save(nowISO, LAST_MODIFIED_KEY);
  }, [save]);

  const pushSyncData = useCallback(
    async (
      key: string,
      dataToPush: SyncDataStructure,
      currentData: sclSettings,
      _force = false,
      displayAlert = true
    ): Promise<void> => {
      if (syncCooldown > 0 && !_force) {
        if (displayAlert) {
          setAlertVariant('warning');
          setAlertMessage(`Please wait ${syncCooldown} seconds between syncs.`);
          setShowAlert(true);
        }
        return;
      }

      if (!key) return;

      try {
        setIsSpinning(true);
        const response = await pushData(key, dataToPush);
        if (response.status === 'success') {
          const updatedData = {
            ...currentData,
            syncKey: key,
            lastSynced: new Date().toISOString(),
          };
          setData(updatedData);
          await save(updatedData);
          startCooldown();
          if (displayAlert) {
            setAlertVariant('success');
            setAlertMessage('Data has been pushed to the cloud!');
            setShowAlert(true);
          }
        } else if (response.status === 'error' && displayAlert) {
          setAlertVariant('danger');
          setAlertMessage(response.error);
          setShowAlert(true);
        }
      } catch (error) {
        console.error('Failed to push', error);
        if (displayAlert) {
          setShowAlert(true);
          setAlertVariant('danger');
          setAlertMessage('Push Failed!');
        }
      } finally {
        setIsSpinning(false);
      }
    },
    [save, syncCooldown, startCooldown]
  );

  const pullSyncData = useCallback(
    async (
      key: string,
      currentData: sclSettings,
      force = false,
      displayAlert = true
    ): Promise<SyncDataStructure | null> => {
      if (syncCooldown > 0 && !force) {
        if (displayAlert) {
          setAlertVariant('warning');
          setAlertMessage(`Please wait ${syncCooldown} seconds between syncs.`);
          setShowAlert(true);
        }
        return null;
      }
      if (!dbs?.filament || !key) {
        if (displayAlert) {
          setAlertMessage('Database not ready or sync key missing.');
          setAlertVariant('warning');
          setShowAlert(true);
        }
        return null;
      }
      try {
        setIsSpinning(true);
        const response = await pullData(key);
        if (response.status === 'success') {
          const nowISO = new Date().toISOString();
          const updatedSettingsData = {
            ...currentData,
            syncKey: response.data?.token ?? key,
            email: (response.data?.userData as { email?: string })?.email ?? currentData.email,
            accountType: response.data?.keyType ?? currentData.accountType,
            lastSynced: nowISO,
            needsVerification: false,
          };
          setData(updatedSettingsData);
          await save(updatedSettingsData);
          startCooldown();
          const serverData: SyncDataStructure = {
            local: (response.data?.data?.local as Filament[]) ?? [],
            regular: (response.data?.data?.regular as Filament[]) ?? [],
          };

          const localExport = (await exportDB(dbs.filament, false)) ?? defaultSyncData;
          const finalDataToImport = mergeSyncData(localExport as SyncDataStructure, serverData);

          await importDB(dbs.filament, finalDataToImport);

          if (displayAlert) {
            setAlertVariant('success');
            setAlertMessage('Data has been pulled and merged locally!');
            setShowAlert(true);
          }
          return finalDataToImport;
        } else if (response.status === 'error' && displayAlert) {
          setAlertVariant('danger');
          setAlertMessage(response.error);
          setShowAlert(true);
        }
      } catch (error) {
        console.error('Failed to pull', error);
        if (displayAlert) {
          setShowAlert(true);
          setAlertVariant('danger');
          setAlertMessage('Pull Failed!');
        }
      } finally {
        setIsSpinning(false);
      }
      return null;
    },
    [dbs, save, syncCooldown, startCooldown]
  );

  const forcePush = async () => {
    if (!dbs?.filament) return;
    const key = dataRef.current.syncKey;
    if (!key) return;
    const localExport = (await exportDB(dbs.filament, false)) as SyncDataStructure;
    await pushSyncData(key, localExport, dataRef.current, true);
  };

  const sync = async (key: string, currentData: sclSettings) => {
    const mergedData = await pullSyncData(key, currentData, true, false);
    if (mergedData) {
      await pushSyncData(key, mergedData, currentData, true, false);
      setAlertVariant('success');
      setAlertMessage('Sync complete: Data successfully pulled and pushed.');
      setShowAlert(true);
    }
  };

  const checkSyncTimestamp = useCallback(async () => {
    if (syncCooldown > 0) {
      setAlertVariant('warning');
      setAlertMessage(`Please wait ${syncCooldown} seconds between syncs.`);
      setShowAlert(true);
      return;
    }
    const currentKey = dataRef.current.syncKey;
    if (!currentKey) {
      setAlertVariant('warning');
      setAlertMessage('Sync key missing');
      setShowAlert(true);
      return;
    }
    try {
      setIsSpinning(true);
      const response = await checkTimestamp(currentKey);
      if (response.status === 'success' && response.timestamp) {
        const responseDate = new Date(response.timestamp);
        const lastSyncedDate = new Date(dataRef.current.lastSynced ?? 0);
        const lastModifiedDate = new Date(lastModified ?? 0);

        // Scenario A: Server is newer. Must pull.
        if (responseDate > lastSyncedDate) {
          setAlertMessage('Newer data found on server, syncing now...');
          setShowAlert(true);
          setAlertVariant('info');
          await sync(currentKey, dataRef.current);
        }
        // Scenario B: Client has local changes server doesn't. Must push.
        else if (lastModifiedDate > lastSyncedDate) {
          setAlertMessage('Local changes detected, pushing to server...');
          setShowAlert(true);
          setAlertVariant('info');
          await forcePush();
        }
        // Scenario C: Everything is already in sync.
        else {
          startCooldown();
          setAlertVariant('warning');
          setAlertMessage('Your data is already up-to-date with the server.');
          setShowAlert(true);
        }
      } else {
        setAlertVariant('danger');
        setAlertMessage(
          (response as { error?: string }).error ||
            'Could not compare sync times: timestamp missing.'
        );
        setShowAlert(true);
      }
    } catch (error) {
      console.error('Failed to check timestamp', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Timestamp Check Failed!');
    }
    setIsSpinning(false);
  }, [syncCooldown, startCooldown, lastModified]);

  const forcePull = async () => {
    const key = dataRef.current.syncKey;
    if (!key) return;
    await pullSyncData(key, dataRef.current, true);
  };

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
          await save(keyData);
          setInitialType('engaged');

          if (dbs.filament) {
            await sync(response.data.token, keyData);
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
    [syncKey, save, dbs]
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
        await save(newData);
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

  const handleForgotKey = async () => {
    if (!isValidEmail(syncEmail)) {
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Invalid Email!');
      return;
    }
    try {
      setIsSpinning(true);
      const response = await forgotSyncKey(syncEmail);
      if (response.status === 'message') {
        setInitialType('setupKey');
        setAlertVariant('info');
        setAlertMessage(response.msg);
      } else if (response.status === 'error') {
        setAlertVariant('danger');
        setAlertMessage(response.error);
      }
      setShowAlert(true);
    } catch (error) {
      console.error('Failed to send recovery email', error);
      setShowAlert(true);
      setAlertVariant('danger');
      setAlertMessage('Recovery email failed to send!');
    }
    setIsSpinning(false);
  };

  const removeSync = async () => {
    if (!window.confirm('Are you sure you want to remove your sync?')) {
      return;
    }
    setInitialType('');
    setData({});
    await save('', 'scl-sync');
    await save('', LAST_MODIFIED_KEY);
    localStorage.removeItem(LAST_SYNC_TIMESTAMP_KEY);
    setLastSyncTime(null);
    setLastModified(null);
    setAlertMessage('Sync Removed');
    setShowAlert(true);
    setAlertVariant('info');
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!dbs.settings || !dbs.filament) return;

      try {
        const [sclSyncDoc, lastModifiedDoc] = await Promise.all([
          getDocumentByColumn(dbs.settings, 'name', 'scl-sync', 'settings'),
          getDocumentByColumn(dbs.settings, 'name', LAST_MODIFIED_KEY, 'settings'),
        ]);

        if (lastModifiedDoc?.value) {
          setLastModified(lastModifiedDoc.value as string);
        }

        const lastSyncTimestamp = localStorage.getItem(LAST_SYNC_TIMESTAMP_KEY);
        if (lastSyncTimestamp) {
          setLastSyncTime(parseInt(lastSyncTimestamp, 10));
        }

        if (sclSyncDoc && sclSyncDoc.value) {
          const syncData = JSON.parse(sclSyncDoc.value as string);
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
    const calculateCooldown = () => {
      if (lastSyncTime) {
        const elapsed = Date.now() - lastSyncTime;
        const remaining = COOLDOWN_SECONDS * 1000 - elapsed;
        if (remaining > 0) {
          setSyncCooldown(Math.ceil(remaining / 1000));
          return;
        }
      }
      setSyncCooldown(0);
    };

    calculateCooldown();
    const intervalId = setInterval(calculateCooldown, 1000);
    return () => clearInterval(intervalId);
  }, [lastSyncTime]);

  return {
    isSpinning,
    data,
    showAlert,
    setShowAlert,
    alertVariant,
    alertMessage,
    initialType,
    setInitialType,
    syncEmail,
    setSyncEmail,
    syncKey,
    setSyncKey,
    handleInputChange,
    existingKey,
    createSync,
    checkSyncTimestamp,
    removeSync,
    syncCooldown,
    handleForgotKey,
    forcePush,
    forcePull,
    updateLastModified,
  };
};
