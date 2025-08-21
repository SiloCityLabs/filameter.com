'use client';

import React from 'react';
import { Row, Col, Pagination, Form } from 'react-bootstrap';
import styles from '@/public/styles/components/Spools.module.css';

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
  return (
    <Row className='mt-3'>
      <Col className='d-flex justify-content-between align-items-center'>
        <div className='d-flex align-items-center'>
          <span className='me-2 text-muted' style={{ fontSize: '0.9rem' }}>
            Items per page:
          </span>
          <Form.Select
            value={itemsPerPage}
            onChange={onItemsPerPageChange}
            size='sm'
            className={styles.itemsPerPageSelect}
            aria-label='Items per page'>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Form.Select>
        </div>
        <Pagination className={`mb-0 ${styles.pagination}`}>
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
      </Col>
    </Row>
  );
};

export default SpoolsPagination;
