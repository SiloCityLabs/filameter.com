import { Button } from 'react-bootstrap';
import styles from '@/public/styles/components/Settings.module.css';
import { SyncInitialType } from '@/hooks/useSync';

interface SyncSetupProps {
  setInitialType: (type: SyncInitialType) => void;
}

export default function SyncSetup({ setInitialType }: SyncSetupProps) {
  return (
    <div className='text-center'>
      <h5 className={styles.paneSubtitle}>Setup Cloud Sync</h5>
      <p className='text-muted'>Sync your data across devices securely.</p>

      {/* Primary Action Buttons */}
      <div className='d-grid gap-2 d-sm-flex justify-content-sm-center mb-3'>
        <Button
          variant='primary'
          onClick={() => setInitialType('setupEmail')}
          size='lg'
          className='px-4 gap-3'>
          Setup with Email
        </Button>
        <Button
          variant='outline-secondary'
          onClick={() => setInitialType('setupKey')}
          size='lg'
          className='px-4'>
          Use Existing Key
        </Button>
      </div>

      {/* Secondary Recovery Link */}
      <div>
        <Button variant='link' onClick={() => setInitialType('forgotKey')} className='fw-bold'>
          Forgot your key?
        </Button>
      </div>
    </div>
  );
}
