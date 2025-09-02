'use client';

import { Spinner } from 'react-bootstrap';
import { CustomAlert } from '@silocitypages/ui-core';
import { useSync } from '@/hooks/useSync';
import styles from '@/public/styles/components/Settings.module.css';

// --- UI Components ---
import SyncSetup from './SyncSetup';
import SyncEmailForm from './SyncEmailForm';
import SyncKeyForm from './SyncKeyForm';
import SyncVerification from './SyncVerification';
import SyncStatus from './SyncStatus';
import SyncForgotKeyForm from './SyncForgotKeyForm';

interface SyncProps {
  verifyKey: string;
}

export default function Sync({ verifyKey }: SyncProps) {
  const {
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
    sync,
  } = useSync(verifyKey);

  const renderContent = () => {
    switch (initialType) {
      case 'loading':
        return (
          <div className='text-center p-4'>
            <Spinner animation='border' variant='primary' />
          </div>
        );
      case 'setupEmail':
        return (
          <SyncEmailForm
            syncEmail={syncEmail}
            handleInputChange={handleInputChange(setSyncEmail)}
            createSync={createSync}
            isSpinning={isSpinning}
            setInitialType={setInitialType}
          />
        );
      case 'setupKey':
        return (
          <SyncKeyForm
            syncKey={syncKey}
            handleInputChange={handleInputChange(setSyncKey)}
            existingKey={() => existingKey()}
            isSpinning={isSpinning}
            setInitialType={setInitialType}
          />
        );
      case 'forgotKey':
        return (
          <SyncForgotKeyForm
            syncEmail={syncEmail}
            handleInputChange={handleInputChange(setSyncEmail)}
            handleForgotKey={handleForgotKey}
            isSpinning={isSpinning}
            setInitialType={setInitialType}
          />
        );
      case 'needs-verification':
        return (
          <SyncVerification
            email={data.email ?? ''}
            syncKey={syncKey}
            handleInputChange={handleInputChange(setSyncKey)}
            existingKey={() => existingKey()}
            isSpinning={isSpinning}
            setInitialType={setInitialType}
          />
        );
      case 'engaged':
        return (
          <SyncStatus
            data={data}
            isSpinning={isSpinning}
            syncCooldown={syncCooldown}
            checkSyncTimestamp={checkSyncTimestamp}
            sync={sync}
            removeSync={removeSync}
          />
        );
      default:
        return <SyncSetup setInitialType={setInitialType} />;
    }
  };

  return (
    <div className={styles.settingsPane}>
      <CustomAlert
        variant={alertVariant || 'success'}
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      />
      {renderContent()}
    </div>
  );
}
