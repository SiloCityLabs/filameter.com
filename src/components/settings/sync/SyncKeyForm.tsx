import { Form, Button, Spinner } from 'react-bootstrap';
import styles from '@/public/styles/components/Settings.module.css';

interface SyncKeyFormProps {
  syncKey: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  existingKey: () => Promise<void>;
  isSpinning: boolean;
  setInitialType: (type: '') => void;
}

export default function SyncKeyForm({
  syncKey,
  handleInputChange,
  existingKey,
  isSpinning,
  setInitialType,
}: SyncKeyFormProps) {
  return (
    <div>
      <h5 className={styles.paneSubtitle}>Setup with Existing Key</h5>
      <Form.Group className='mb-3'>
        <Form.Label>Your Sync Key</Form.Label>
        <Form.Control
          type='text'
          placeholder='Enter your sync key'
          value={syncKey}
          onChange={handleInputChange}
          disabled={isSpinning}
        />
      </Form.Group>
      <Button variant='primary' onClick={existingKey} disabled={isSpinning}>
        {isSpinning ? <Spinner as='span' size='sm' /> : 'Finish Setup'}
      </Button>
      <Button variant='link' onClick={() => setInitialType('')} className='ms-2'>
        Cancel
      </Button>
    </div>
  );
}
