'use client';

import { Form, Button, Spinner } from 'react-bootstrap';
import styles from '@/public/styles/components/Settings.module.css';

interface SyncForgotKeyFormProps {
  syncEmail: string;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleForgotKey: () => Promise<void>;
  isSpinning: boolean;
  setInitialType: (type: 'setupKey' | '') => void;
}

export default function SyncForgotKeyForm({
  syncEmail,
  handleInputChange,
  handleForgotKey,
  isSpinning,
  setInitialType,
}: SyncForgotKeyFormProps) {
  return (
    <div>
      <h5 className={styles.paneSubtitle}>Recover Sync Key</h5>
      <p className='text-muted'>
        Enter the email address associated with your account, and we&apos;ll send you a link to
        recover your sync key.
      </p>
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
      <Button variant='primary' onClick={handleForgotKey} disabled={isSpinning}>
        {isSpinning ? <Spinner as='span' size='sm' /> : 'Send Recovery Email'}
      </Button>
      <Button variant='link' onClick={() => setInitialType('')} className='ms-2'>
        Cancel
      </Button>
    </div>
  );
}
