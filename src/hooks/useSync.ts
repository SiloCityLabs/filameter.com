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

  const startCooldown = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, now.toString());
    setLastSyncTime(now);
  }, []);

  const pushSyncData = useCallback(
    async (
      key: string,
      dataToPush: SyncDataStructure,
      currentData: sclSettings,
      _force = false
    ): Promise<void> => {
      if (syncCooldown > 0 && !_force) {
        setAlertVariant('warning');
        setAlertMessage(`Please wait ${syncCooldown} seconds between syncs.`);
        setShowAlert(true);
        return;
      }

      if (!key) return;

      try {
        setIsSpinning(true);
        const response = await pushData(key, dataToPush);
        if (response.status === 'success') {
          // lastSynced is only updated after a successful push to the server.
          const updatedData = {
            ...currentData,
            syncKey: key,
            lastSynced: new Date().toISOString(),
          };
          setData(updatedData);
          await save({ 'scl-sync': updatedData });
          startCooldown();
          setAlertVariant('success');
          setAlertMessage('Data has been pushed to the cloud!');
        } else if (response.status === 'error') {
          setAlertVariant('danger');
          setAlertMessage(response.error);
        }
        setShowAlert(true);
      } catch (error) {
        console.error('Failed to push', error);
        setShowAlert(true);
        setAlertVariant('danger');
        setAlertMessage('Push Failed!');
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
      force = false
    ): Promise<SyncDataStructure | null> => {
      if (syncCooldown > 0 && !force) {
        setAlertVariant('warning');
        setAlertMessage(`Please wait ${syncCooldown} seconds between syncs.`);
        setShowAlert(true);
        return null;
      }
      if (!dbs?.filament || !key) {
        setAlertMessage('Database not ready or sync key missing.');
        setAlertVariant('warning');
        setShowAlert(true);
        return null;
      }
      try {
        setIsSpinning(true);
        const response = await pullData(key);
        if (response.status === 'success') {
          // lastSynced is only updated after a successful pull from the server.
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
          await save({ 'scl-sync': updatedSettingsData });
          startCooldown();

          const serverData: SyncDataStructure = {
            local: (response.data?.data?.local as Filament[]) ?? [],
            regular: (response.data?.data?.regular as Filament[]) ?? [],
          };

          const localExport = (await exportDB(dbs.filament, false)) ?? defaultSyncData;
          const finalDataToImport = mergeSyncData(localExport as SyncDataStructure, serverData);

          await importDB(dbs.filament, finalDataToImport);

          setAlertVariant('success');
          setAlertMessage('Data has been pulled and merged locally!');
          setShowAlert(true);
          return finalDataToImport;
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
      } finally {
        setIsSpinning(false);
      }
      return null;
    },
    [dbs, save, syncCooldown, startCooldown]
  );

  // Orchestrates the full sync process: pull, merge, then push.
  const sync = async (key: string, currentData: sclSettings) => {
    const mergedData = await pullSyncData(key, currentData, true);
    if (mergedData) {
      await pushSyncData(key, mergedData, currentData, true);
    }
  };

  const forcePush = async () => {
    if (!dbs?.filament) return;
    const key = dataRef.current.syncKey;
    if (!key) return;
    const localExport = (await exportDB(dbs.filament, false)) as SyncDataStructure;
    await pushSyncData(key, localExport, dataRef.current, true);
  };

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
          // Initially, lastSynced is null because no sync has occurred yet.
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

          if (dbs.filament) {
            // Perform the first sync, which will set the initial lastSynced timestamp.
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

  // This is the "smart sync" function called by the UI.
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
      if (response.status === 'success') {
        if (response.timestamp) {
          const responseDate = new Date(response.timestamp);
          const lastSyncedDate = new Date(dataRef.current.lastSynced ?? 0);

          // Core Logic: Only sync if the server's data is newer.
          if (responseDate > lastSyncedDate) {
            setAlertMessage('Newer data found on server, syncing now...');
            setShowAlert(true);
            setAlertVariant('info');
            await sync(currentKey, dataRef.current);
          } else {
            // If local data is up-to-date, just reset the cooldown.
            startCooldown();
            setAlertVariant('warning');
            setAlertMessage('Your data is already up-to-date with the server.');
            setShowAlert(true);
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
  }, [syncCooldown, startCooldown]);

  const removeSync = async () => {
    if (!window.confirm('Are you sure you want to remove your sync?')) {
      return;
    }
    setInitialType('');
    setData({});
    await save({ 'scl-sync': '' });
    localStorage.removeItem(LAST_SYNC_TIMESTAMP_KEY);
    setLastSyncTime(null);
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
        const lastSyncTimestamp = localStorage.getItem(LAST_SYNC_TIMESTAMP_KEY);
        if (lastSyncTimestamp) {
          setLastSyncTime(parseInt(lastSyncTimestamp, 10));
        }

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
  };
};
