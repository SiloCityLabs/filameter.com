'use client';

import React from 'react';
import { Table, Button, OverlayTrigger, Tooltip, Spinner, Row, Col } from 'react-bootstrap';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPenToSquare, faTrash, faCopy } from '@fortawesome/free-solid-svg-icons';
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
  onDelete, // Corrected: Renamed from handleDelete to onDelete as per props
  onSortClick,
  sortKey,
  sortDirection,
}) => {
  const renderHeader = (key: keyof Filament, title: string) => {
    if (settings?.spoolHeaders && settings.spoolHeaders[title] === false) {
      return null;
    }

    return (
      <th
        className='text-center align-middle'
        style={{ cursor: 'pointer' }}
        onClick={() => onSortClick(key)}>
        {title}{' '}
        {sortKey === key ? (
          sortDirection === 'asc' ? (
            '▲'
          ) : (
            '▼'
          )
        ) : (
          <span style={{ color: 'lightgrey' }}>▲▼</span>
        )}
      </th>
    );
  };

  return (
    <Row>
      <Col xs={12}>
        <div className='table-responsive'>
          <Table striped bordered hover size='sm' className='align-middle'>
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
                <th className='text-center align-middle'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isDeleting && (
                <tr>
                  <td colSpan={9} className='text-center text-muted'>
                    <Spinner animation='border' size='sm' className='me-2' /> Deleting...
                  </td>
                </tr>
              )}
              {!isDeleting && currentItems.length > 0 ? (
                currentItems.map((filament) => (
                  <tr key={`filament-${filament._id}`}>
                    {(!settings?.spoolHeaders || settings.spoolHeaders['ID'] !== false) && (
                      <td className='text-center'>
                        <OverlayTrigger
                          placement='top'
                          delay={{ show: 400, hide: 250 }}
                          overlay={
                            <Tooltip style={{ position: 'fixed' }}>{filament._id || 'N/A'}</Tooltip>
                          }>
                          <span style={{ cursor: 'help' }}>
                            {filament._id ? `${filament._id.substring(0, 5)}...` : 'N/A'}
                          </span>
                        </OverlayTrigger>
                      </td>
                    )}
                    {(!settings?.spoolHeaders || settings.spoolHeaders['Filament'] !== false) && (
                      <td className='text-center'>{filament.filament}</td>
                    )}
                    {(!settings?.spoolHeaders || settings.spoolHeaders['Material'] !== false) && (
                      <td className='text-center'>{filament.material}</td>
                    )}
                    {(!settings?.spoolHeaders || settings.spoolHeaders['Used (g)'] !== false) && (
                      <td className='text-center'>{filament.used_weight}</td>
                    )}
                    {(!settings?.spoolHeaders || settings.spoolHeaders['Total (g)'] !== false) && (
                      <td className='text-center'>{filament.total_weight}</td>
                    )}
                    {(!settings?.spoolHeaders ||
                      settings.spoolHeaders['Remaining (g)'] !== false) && (
                      <td className='text-center'>{filament?.calc_weight ?? ''}</td>
                    )}
                    {(!settings?.spoolHeaders || settings.spoolHeaders['Location'] !== false) && (
                      <td className='text-center'>{filament.location}</td>
                    )}
                    {(!settings?.spoolHeaders || settings.spoolHeaders['Comments'] !== false) && (
                      <td className='text-center'>
                        {filament.comments && filament.comments.length > 20 ? (
                          <OverlayTrigger
                            placement='top'
                            delay={{ show: 400, hide: 250 }}
                            overlay={
                              <Tooltip style={{ position: 'fixed' }}>{filament.comments}</Tooltip>
                            }>
                            <span style={{ cursor: 'help' }}>{`${filament.comments.substring(
                              0,
                              17
                            )}...`}</span>
                          </OverlayTrigger>
                        ) : (
                          filament.comments
                        )}
                      </td>
                    )}

                    <td className='text-center'>
                      <div className='d-flex justify-content-center align-items-center flex-nowrap'>
                        <OverlayTrigger
                          placement='top'
                          overlay={<Tooltip style={{ position: 'fixed' }}>Edit</Tooltip>}>
                          <Link href={`/manage-filament?id=${filament._id}`} passHref>
                            <Button variant='outline-primary' size='sm' className='me-1 py-0 px-1'>
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
                            className='me-1 py-0 px-1'
                            onClick={() => onDelete(filament._id)} // Corrected: Changed to onDelete
                            disabled={isDeleting}>
                            <FontAwesomeIcon icon={faTrash} />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement='top'
                          overlay={<Tooltip style={{ position: 'fixed' }}>Duplicate</Tooltip>}>
                          <Link
                            href={`/manage-filament?id=${filament._id}&type=duplicate`}
                            passHref>
                            <Button variant='outline-secondary' size='sm' className='py-0 px-1'>
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
                  <td colSpan={9} className='text-center fst-italic text-muted'>
                    No spools found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </Col>
    </Row>
  );
};

export default SpoolsTable;
