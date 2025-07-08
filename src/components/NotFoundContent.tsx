'use client';

// --- React ---
import React from 'react';
import { Card, Button } from 'react-bootstrap';
// --- Next ---
import Link from 'next/link';
// --- Styles & Icons ---
import styles from '@/public/styles/components/NotFound.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faQuestionCircle, faHome } from '@fortawesome/free-solid-svg-icons';

export default function NotFoundContent() {
  return (
    <Card className={styles.statusCard}>
      <Card.Body>
        <FontAwesomeIcon icon={faQuestionCircle} className={styles.statusIcon} />
        <h1 className={styles.errorCode}>404</h1>
        <h2 className={styles.statusTitle}>Page Not Found</h2>
        <p className='text-muted mt-2 mb-4'>
          Sorry, the page you are looking for does not exist or might have been moved.
        </p>
        <Link href='/' passHref>
          <Button variant='primary' size='lg'>
            <FontAwesomeIcon icon={faHome} className='me-2' />
            Go back to Homepage
          </Button>
        </Link>
      </Card.Body>
    </Card>
  );
}
