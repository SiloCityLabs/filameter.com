import { Button } from 'react-bootstrap';
import styles from '@/public/styles/components/Settings.module.css';

interface SyncSetupProps {
  setInitialType: (type: 'setupEmail' | 'setupKey') => void;
}

export default function SyncSetup({ setInitialType }: SyncSetupProps) {
  return (
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
  );
}
