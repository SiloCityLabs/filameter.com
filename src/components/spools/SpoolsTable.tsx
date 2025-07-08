'use client';

import React from 'react';
import { Table, Button, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPenToSquare,
  faTrash,
  faCopy,
  faSort,
  faSortUp,
  faSortDown,
} from '@fortawesome/free-solid-svg-icons';
import styles from '@/public/styles/components/Spools.module.css';
import type { Filament } from '@/types/Filament';
import type { sclSettings } from '@silocitypages/ui-core';

interface SpoolsTableProps {
  currentItems: Filament[];
  isDeleting: boolean;
  settings: sclSettings;
  onDelete: (id: string | undefined) => Promise<void>;
  onSortClick: (key: keyof Filament) => void;
  sortKey: keyof Filament | null;
  sortDirection: 'asc' | 'desc';
}

const SpoolsTable: React.FC<SpoolsTableProps> = ({
  currentItems,
  isDeleting,
  settings,
  onDelete,
  onSortClick,
  sortKey,
  sortDirection,
}) => {
  const renderSortIcon = (key: keyof Filament) => {
    if (sortKey !== key) {
      return <FontAwesomeIcon icon={faSort} className='ms-2 text-muted' />;
    }
    return sortDirection === 'asc' ? (
      <FontAwesomeIcon icon={faSortUp} className='ms-2' />
    ) : (
      <FontAwesomeIcon icon={faSortDown} className='ms-2' />
    );
  };

  const renderHeader = (key: keyof Filament, title: string) => {
    if (settings?.spoolHeaders && settings.spoolHeaders[title] === false) return null;
    return (
      <th onClick={() => onSortClick(key)} className={styles.tableHeader}>
        {title} {renderSortIcon(key)}
      </th>
    );
  };

  return (
    <div className='table-responsive'>
      <Table hover className={styles.spoolsTable}>
        <thead>
          <tr>
            {renderHeader('_id', 'ID')}
            {renderHeader('filament', 'Filament')}
            {renderHeader('material', 'Material')}
            {renderHeader('used_weight', 'Used (g)')}
            {renderHeader('total_weight', 'Total (g)')}
            {renderHeader('calc_weight', 'Remaining (g)')}
            {renderHeader('location', 'Location')}
            {renderHeader('comments', 'Comments')}
            <th className={`${styles.tableHeader} text-center`}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {isDeleting ? (
            <tr>
              <td colSpan={9} className='text-center text-muted py-4'>
                <Spinner animation='border' size='sm' className='me-2' /> Deleting...
              </td>
            </tr>
          ) : currentItems.length > 0 ? (
            currentItems.map((filament) => (
              <tr key={`filament-${filament._id}`}>
                {(!settings?.spoolHeaders || settings.spoolHeaders['ID'] !== false) && (
                  <td>
                    <OverlayTrigger
                      placement='top'
                      overlay={
                        <Tooltip style={{ position: 'fixed' }}>{filament._id || 'N/A'}</Tooltip>
                      }>
                      <span className='text-muted' style={{ cursor: 'help' }}>
                        {filament._id ? `${filament._id.substring(0, 5)}...` : 'N/A'}
                      </span>
                    </OverlayTrigger>
                  </td>
                )}
                {(!settings?.spoolHeaders || settings.spoolHeaders['Filament'] !== false) && (
                  <td>{filament.filament}</td>
                )}
                {(!settings?.spoolHeaders || settings.spoolHeaders['Material'] !== false) && (
                  <td>{filament.material}</td>
                )}
                {(!settings?.spoolHeaders || settings.spoolHeaders['Used (g)'] !== false) && (
                  <td>{filament.used_weight}</td>
                )}
                {(!settings?.spoolHeaders || settings.spoolHeaders['Total (g)'] !== false) && (
                  <td>{filament.total_weight}</td>
                )}
                {(!settings?.spoolHeaders || settings.spoolHeaders['Remaining (g)'] !== false) && (
                  <td>{filament?.calc_weight ?? ''}</td>
                )}
                {(!settings?.spoolHeaders || settings.spoolHeaders['Location'] !== false) && (
                  <td>{filament.location}</td>
                )}
                {(!settings?.spoolHeaders || settings.spoolHeaders['Comments'] !== false) && (
                  <td>
                    {filament.comments && filament.comments.length > 20 ? (
                      <OverlayTrigger
                        placement='top'
                        overlay={
                          <Tooltip style={{ position: 'fixed' }}>{filament.comments}</Tooltip>
                        }>
                        <span
                          style={{
                            cursor: 'help',
                          }}>{`${filament.comments.substring(0, 17)}...`}</span>
                      </OverlayTrigger>
                    ) : (
                      filament.comments
                    )}
                  </td>
                )}
                <td className='text-center'>
                  <div className='d-flex justify-content-center align-items-center flex-nowrap gap-2'>
                    <OverlayTrigger
                      placement='top'
                      overlay={<Tooltip style={{ position: 'fixed' }}>Edit</Tooltip>}>
                      <Link href={`/manage-filament?id=${filament._id}`} passHref>
                        <Button variant='outline-primary' size='sm' className={styles.actionButton}>
                          <FontAwesomeIcon icon={faPenToSquare} />
                        </Button>
                      </Link>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement='top'
                      overlay={<Tooltip style={{ position: 'fixed' }}>Delete</Tooltip>}>
                      <Button
                        variant='outline-danger'
                        size='sm'
                        className={styles.actionButton}
                        onClick={() => onDelete(filament._id)}
                        disabled={isDeleting}>
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement='top'
                      overlay={<Tooltip style={{ position: 'fixed' }}>Duplicate</Tooltip>}>
                      <Link href={`/manage-filament?id=${filament._id}&type=duplicate`} passHref>
                        <Button
                          variant='outline-secondary'
                          size='sm'
                          className={styles.actionButton}>
                          <FontAwesomeIcon icon={faCopy} />
                        </Button>
                      </Link>
                    </OverlayTrigger>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className='text-center fst-italic text-muted py-4'>
                No spools found. Try adding one!
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default SpoolsTable;
