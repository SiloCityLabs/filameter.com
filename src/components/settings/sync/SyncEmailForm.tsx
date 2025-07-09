import { Form, Button, Spinner } from 'react-bootstrap';
import styles from '@/public/styles/components/Settings.module.css';

interface SyncEmailFormProps {
  syncEmail: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  createSync: () => Promise<void>;
  isSpinning: boolean;
  setInitialType: (type: '') => void;
}

export default function SyncEmailForm({
  syncEmail,
  handleInputChange,
  createSync,
  isSpinning,
  setInitialType,
}: SyncEmailFormProps) {
  return (
    <div>
      <h5 className={styles.paneSubtitle}>Setup with Email</h5>
      <Form.Group className='mb-3'>
        <Form.Label>Your Email Address</Form.Label>
        <Form.Control
          type='email'
          placeholder='Enter your email'
          value={syncEmail}
          onChange={handleInputChange}
          disabled={isSpinning}
        />
      </Form.Group>
      <Button variant='primary' onClick={createSync} disabled={isSpinning}>
        {isSpinning ? <Spinner as='span' size='sm' /> : 'Finish Setup'}
      </Button>
      <Button variant='link' onClick={() => setInitialType('')} className='ms-2'>
        Cancel
      </Button>
    </div>
  );
}
