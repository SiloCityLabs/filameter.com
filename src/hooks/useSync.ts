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
import type { sclSettings } from '@silocitypages/ui-core';
import type { Filament } from '@/types/Filament';
import { ApiErrorResponse } from '@/types/api';

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

  const startCooldown = useCallback(() => {
    const now = Date.now();
    localStorage.setItem(LAST_SYNC_TIMESTAMP_KEY, now.toString());
    setLastSyncTime(now);
  }, []);

  const pushSyncData = useCallback(
    async (_force = false, syncData?: sclSettings, dataToPush: SyncDataStructure = dbExport) => {
      if (syncCooldown > 0) {
        setAlertVariant('warning');
        setAlertMessage(`Please wait ${syncCooldown} seconds between syncs.`);
        setShowAlert(true);
        return;
      }

      const dataToUse = syncData || dataRef.current;
      if (!dataToUse?.syncKey) {
        return;
      }
      try {
        setIsSpinning(true);
        const response = await pushData(dataToUse.syncKey, dataToPush);
        if (response.status === 'success') {
          const updatedData = { ...dataToUse, lastSynced: new Date().toISOString() };
          setData(updatedData);
          await save({ 'scl-sync': updatedData });
          startCooldown();
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
    [dbExport, save, syncCooldown, startCooldown]
  );

  const pullSyncData = useCallback(
    async (force = false) => {
      if (syncCooldown > 0 && !force) {
        setAlertVariant('warning');
        setAlertMessage(`Please wait ${syncCooldown} seconds between syncs.`);
        setShowAlert(true);
        return;
      }
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
          startCooldown();
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
            // This internal push should bypass cooldown checks.
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dbs, data, dbExport, save, syncCooldown, startCooldown]
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

          if ((key || initialType === 'needs-verification') && dbs.filament) {
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
    [syncKey, save, pushSyncData, dbs, initialType]
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
        setInitialType('setupKey'); // Go back to the key entry screen
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

  const checkSyncTimestamp = useCallback(async () => {
    if (syncCooldown > 0) {
      setAlertVariant('warning');
      setAlertMessage(`Please wait ${syncCooldown} seconds between syncs.`);
      setShowAlert(true);
      return;
    }
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
              await pullSyncData(true); // Force pull to bypass its own cooldown check
            } else {
              startCooldown(); // Start cooldown even if up-to-date to prevent spamming
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
  }, [data, pullSyncData, syncCooldown, startCooldown]);

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
    pushSyncData,
    pullSyncData,
    removeSync,
    syncCooldown,
    handleForgotKey,
  };
};
