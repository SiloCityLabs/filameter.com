import React from 'react';
import { Button, Card, Spinner } from 'react-bootstrap';
import type { sclSettings } from '@silocitypages/ui-core';

interface SyncStatusProps {
  data: sclSettings;
  isSpinning: boolean;
  syncCooldown: number;
  checkSyncTimestamp: () => void;
  sync: () => void; // Added sync function
  removeSync: () => void;
}

const SyncStatus: React.FC<SyncStatusProps> = ({
  data,
  isSpinning,
  syncCooldown,
  checkSyncTimestamp,
  sync,
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
          <strong>Account Type:</strong> {data.accountType}
        </p>
        <p>
          <strong>Last Synced:</strong>{' '}
          {data.lastSynced ? new Date(data.lastSynced).toLocaleString() : 'Never'}
        </p>
        <div className='d-grid gap-2'>
          <Button variant='primary' onClick={sync} disabled={isSpinning || syncCooldown > 0}>
            {isSpinning ? <Spinner as='span' animation='border' size='sm' /> : 'Sync Data'}
          </Button>
          <Button
            variant='secondary'
            onClick={checkSyncTimestamp}
            disabled={isSpinning || syncCooldown > 0}>
            {isSpinning ? <Spinner as='span' animation='border' size='sm' /> : 'Check for Updates'}
          </Button>
          <Button variant='danger' onClick={removeSync} disabled={isSpinning}>
            Remove Sync
          </Button>
        </div>
        {syncCooldown > 0 && (
          <p className='text-muted mt-2'>Sync available in {syncCooldown} seconds</p>
        )}
      </Card.Body>
    </Card>
  );
};

export default SyncStatus;
