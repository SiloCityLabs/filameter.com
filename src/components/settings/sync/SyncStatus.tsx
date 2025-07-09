import { Button, Card } from 'react-bootstrap';
import styles from '@/public/styles/components/Settings.module.css';
import type { sclSettings } from '@silocitypages/ui-core';

interface SyncStatusProps {
  data: sclSettings;
  isSpinning: boolean;
  syncCooldown: number;
  checkSyncTimestamp: () => Promise<void>;
  pushSyncData: (force: boolean) => Promise<void>;
  pullSyncData: (force: boolean) => Promise<void>;
  removeSync: () => Promise<void>;
}

export default function SyncStatus({
  data,
  isSpinning,
  syncCooldown,
  checkSyncTimestamp,
  pushSyncData,
  pullSyncData,
  removeSync,
}: SyncStatusProps) {
  return (
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
        <Button variant='outline-warning' onClick={() => pushSyncData(true)} disabled={isSpinning}>
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
  );
}
