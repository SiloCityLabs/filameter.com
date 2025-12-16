import React from 'react';
import { Button, Card } from 'react-bootstrap';
import type { sclSettings } from '@silocitypages/ui-core';

interface SyncStatusProps {
  data: sclSettings;
  isSpinning: boolean;
  syncCooldown: number;
  checkSyncTimestamp: () => void;
  forcePush: () => void;
  forcePull: () => void;
  removeSync: () => void;
}

const SyncStatus: React.FC<SyncStatusProps> = ({
  data,
  isSpinning,
  syncCooldown,
  checkSyncTimestamp,
  forcePush,
  forcePull,
  removeSync,
}) => {
  return (
    <Card>
      <Card.Header>Sync Status</Card.Header>
      <Card.Body>
        <p>
          <strong>Email:</strong> {data.email}
        </p>
        <p>
          <strong>Sync Key:</strong> {data.syncKey}
        </p>
        <p>
          <strong>Account Type:</strong> {data.accountType}
        </p>
        <p>
          <strong>Last Synced:</strong>{' '}
          {data.lastSynced ? new Date(data.lastSynced).toLocaleString() : 'Never'}
        </p>
        <div className='mt-3 d-flex flex-wrap gap-2'>
          <Button
            variant='primary'
            onClick={checkSyncTimestamp}
            disabled={isSpinning || syncCooldown > 0}>
            {syncCooldown > 0 ? `Sync (${syncCooldown}s)` : 'Sync Now'}
          </Button>
          <Button
            variant='outline-warning'
            onClick={forcePush}
            disabled={isSpinning || syncCooldown > 0}>
            {syncCooldown > 0 ? `Push (${syncCooldown}s)` : 'Force Push'}
          </Button>
          <Button
            variant='outline-info'
            onClick={forcePull}
            disabled={isSpinning || syncCooldown > 0}>
            {syncCooldown > 0 ? `Pull (${syncCooldown}s)` : 'Force Pull'}
          </Button>
          <Button
            variant='outline-danger'
            onClick={removeSync}
            disabled={isSpinning}
            className='ms-md-auto'>
            Remove Sync
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default SyncStatus;
