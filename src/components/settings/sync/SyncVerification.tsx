import { Form, Button, Spinner } from 'react-bootstrap';
import styles from '@/public/styles/components/Settings.module.css';

interface SyncVerificationProps {
  email: string;
  syncKey: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  existingKey: () => Promise<void>;
  isSpinning: boolean;
  setInitialType: (type: '') => void;
}

export default function SyncVerification({
  email,
  syncKey,
  handleInputChange,
  existingKey,
  isSpinning,
  setInitialType,
}: SyncVerificationProps) {
  return (
    <div>
      <h5 className={styles.paneSubtitle}>Check Your Email</h5>
      <p className='text-muted'>
        We&apos;ve sent a verification key to <strong>{email}</strong>. Please enter it below.
      </p>
      <Form.Group className='mb-3'>
        <Form.Label>Verification Key</Form.Label>
        <Form.Control
          type='text'
          placeholder='Enter key from email'
          value={syncKey}
          onChange={handleInputChange}
        />
      </Form.Group>
      <Button variant='primary' onClick={existingKey} disabled={isSpinning}>
        {isSpinning ? <Spinner as='span' size='sm' /> : 'Complete Setup'}
      </Button>
      <Button variant='link' onClick={() => setInitialType('')} className='ms-2'>
        Cancel
      </Button>
    </div>
  );
}
