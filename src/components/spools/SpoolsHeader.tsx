'use client';

import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp, faPlus } from '@fortawesome/free-solid-svg-icons';
import styles from '@/public/styles/components/Spools.module.css';

interface SpoolsHeaderProps {
  isSpinning: boolean;
  syncCooldown: number;
  syncKey: string | undefined;
  onSync: () => void;
  searchTerm: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SpoolsHeader: React.FC<SpoolsHeaderProps> = ({
  isSpinning,
  syncCooldown,
  syncKey,
  onSync,
  searchTerm,
  onSearchChange,
}) => {
  return (
    <>
      <Row className={`align-items-center mb-4 ${styles.pageHeader}`}>
        <Col>
          <h1 className='mb-0'>Your Filament Spools</h1>
        </Col>
        <Col xs='auto' className='d-flex gap-2'>
          <Button
            variant='outline-secondary'
            disabled={isSpinning || syncCooldown > 0 || !syncKey}
            onClick={onSync}
            className={styles.headerButton}>
            <FontAwesomeIcon
              icon={faCloudArrowUp}
              className={isSpinning ? 'fa-spin me-2' : 'me-2'}
            />
            {syncCooldown > 0 ? `Sync (${syncCooldown}s)` : 'Sync'}
          </Button>
          {isSpinning ? (
            <Button variant='primary' className={styles.headerButton} disabled>
              <FontAwesomeIcon icon={faPlus} className='me-2' />
              Add Filament
            </Button>
          ) : (
            <Link href='/manage-filament' passHref>
              <Button variant='primary' className={styles.headerButton}>
                <FontAwesomeIcon icon={faPlus} className='me-2' />
                Add Filament
              </Button>
            </Link>
          )}
        </Col>
      </Row>
      <Row className='mb-3'>
        <Col>
          <Form.Control
            type='text'
            placeholder='Search by ID, Name, Material, Location...'
            value={searchTerm}
            onChange={onSearchChange}
            className={styles.searchInput}
            disabled={isSpinning}
          />
        </Col>
      </Row>
    </>
  );
};

export default SpoolsHeader;
