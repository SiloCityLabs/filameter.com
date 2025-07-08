'use client';

// --- React ---
import React from 'react';
import { Row, Col, Form, Button } from 'react-bootstrap';
// --- Next ---
import Link from 'next/link';
// --- FontAwesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';

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
      <Row className='mb-3'>
        <Col>
          <h1>Spools</h1>
        </Col>
        <Col xs='auto'>
          <Button
            variant='primary'
            disabled={isSpinning || syncCooldown > 0 || !syncKey}
            onClick={onSync}>
            <FontAwesomeIcon icon={faCloudArrowUp} className='me-2' />
            {syncCooldown > 0 ? `Sync (${syncCooldown}s)` : 'Sync'}
          </Button>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={8} className='mb-2'>
          <Form.Control
            type='text'
            placeholder='Search by ID, Name, Material, Location...'
            value={searchTerm}
            onChange={onSearchChange}
            size='sm'
          />
        </Col>
        <Col xs={12} md={4} className='text-md-end mb-2'>
          <Link href='/manage-filament' passHref>
            <Button variant='primary' size='sm' className='w-50 w-md-auto'>
              Add Filament
            </Button>
          </Link>
        </Col>
      </Row>
    </>
  );
};

export default SpoolsHeader;
