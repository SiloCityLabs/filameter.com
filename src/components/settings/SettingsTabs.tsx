'use client';

import { useState, useEffect } from 'react';
import { Tabs, Tab, Spinner } from 'react-bootstrap';
// --- Next ---
import { useSearchParams } from 'next/navigation';
// --- Components ---
import ImportExport from '@/components/settings/ImportExport';
import MainSettings from '@/components/settings/MainSettings';
import Sync from '@/components/settings/Sync';

export default function SettingsTabs() {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [key, setKey] = useState<string>('settings');
  const [verifyKey, setVerifyKey] = useState<string>('');

  useEffect(() => {
    const keyParam = searchParams?.get('key') ?? '';
    if (keyParam !== '') {
      setVerifyKey(keyParam);
      setKey('scl-sync');
    }
    setIsLoading(false);
  }, [searchParams]);

  if (isLoading) {
    return (
      <div className='text-center p-5'>
        <Spinner animation='border' role='status'>
          <span className='visually-hidden'>Loading Settings...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <Tabs activeKey={key} onSelect={(k) => setKey(k ?? 'settings')} className='mb-3'>
      <Tab eventKey='settings' title='Settings'>
        <MainSettings />
      </Tab>
      <Tab eventKey='import-export' title='Import/Export'>
        <ImportExport />
      </Tab>
      <Tab eventKey='scl-sync' title='Cloud Sync'>
        <Sync verifyKey={verifyKey ?? ''} />
      </Tab>
    </Tabs>
  );
}
