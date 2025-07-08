'use client';

// --- React ---
import React from 'react';
import { Row, Col, Pagination, Form } from 'react-bootstrap';

interface SpoolsPaginationProps {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  onItemsPerPageChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onPageChange: (page: number) => void;
}

const SpoolsPagination: React.FC<SpoolsPaginationProps> = ({
  currentPage,
  totalPages,
  itemsPerPage,
  onItemsPerPageChange,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null; // Don't render pagination if there's only one page or no items
  }

  return (
    <Row>
      <Col xs={12} className='d-flex justify-content-between align-items-center mt-3'>
        <Pagination size='sm' className='mb-0'>
          <Pagination.Prev
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          />
          <Pagination.Item active>{currentPage}</Pagination.Item>
          {currentPage < totalPages && <Pagination.Ellipsis disabled />}
          {currentPage < totalPages && (
            <Pagination.Item onClick={() => onPageChange(totalPages)}>{totalPages}</Pagination.Item>
          )}
          <Pagination.Next
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
          />
        </Pagination>
        <div className='d-flex align-items-center'>
          <span className='me-2 text-muted' style={{ fontSize: '0.8rem' }}>
            Items/page:
          </span>
          <Form.Select
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            size='sm'
            style={{ width: 'auto' }}
            aria-label='Items per page'>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
        </div>
      </Col>
    </Row>
  );
};

export default SpoolsPagination;
