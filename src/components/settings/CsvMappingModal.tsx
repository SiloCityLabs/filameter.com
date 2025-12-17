'use client';

import React, { useEffect, useState } from 'react';
import { Form, Table, Spinner, Alert } from 'react-bootstrap';
import { CustomModal } from '@silocitypages/ui-core';
import { Filament } from '@/types/Filament';
import {
  FILAMENT_FIELDS,
  getCsvHeaders,
  parseAndMapCsv,
} from '@/helpers/database/filament/csvUtils';

interface CsvMappingModalProps {
  show: boolean;
  file: File | null;
  onClose: () => void;
  onSave: (data: Filament[]) => Promise<void>;
}

export default function CsvMappingModal({ show, file, onClose, onSave }: CsvMappingModalProps) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (file && show) {
      setLoading(true);
      setError(null);
      getCsvHeaders(file)
        .then((headers) => {
          setHeaders(headers);

          // Auto-guess mapping
          const initialMapping: Record<string, string> = {};
          // Keep track of which internal fields we've already assigned to avoid duplicates during auto-guess
          const assignedFields = new Set<string>();

          headers.forEach((header) => {
            const lowerHeader = header.toLowerCase();
            const match = FILAMENT_FIELDS.find((f) => {
              const matchesKey = lowerHeader.includes(f.key);
              const matchesLabel = lowerHeader.includes(f.label.toLowerCase());
              return (matchesKey || matchesLabel) && !assignedFields.has(f.key);
            });

            if (match) {
              initialMapping[header] = match.key;
              assignedFields.add(match.key);
            } else {
              initialMapping[header] = 'ignore';
            }
          });
          setMapping(initialMapping);
        })
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }
  }, [file, show]);

  const handleMappingChange = (header: string, field: string) => {
    setMapping((prev) => ({ ...prev, [header]: field }));
  };

  const handleProcessAndSave = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const data = await parseAndMapCsv(file, mapping as any);
      await onSave(data);
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to process CSV file.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate which fields are already used in the mapping (excluding 'ignore')
  const usedFields = new Set(Object.values(mapping).filter((v) => v !== 'ignore'));

  return (
    <CustomModal
      show={show}
      title='Map CSV Columns'
      variant='primary'
      onClose={onClose}
      onSave={handleProcessAndSave}>
      {loading && !headers.length ? (
        <div className='text-center py-3'>
          <Spinner animation='border' size='sm' /> Parsing file...
        </div>
      ) : error ? (
        <Alert variant='danger'>{error}</Alert>
      ) : (
        <>
          <p className='small text-muted mb-3'>
            Map columns from your CSV to FilaMeter fields. <br />
            <strong>Note:</strong> Unmapped columns will be added to the comments.
          </p>
          <div style={{ maxHeight: '50vh', overflowY: 'auto' }}>
            <Table striped bordered hover size='sm'>
              <thead>
                <tr>
                  <th>CSV Header</th>
                  <th>Map To Field</th>
                </tr>
              </thead>
              <tbody>
                {headers.map((header) => (
                  <tr key={header}>
                    <td className='align-middle'>{header}</td>
                    <td>
                      <Form.Select
                        size='sm'
                        value={mapping[header] || 'ignore'}
                        onChange={(e) => handleMappingChange(header, e.target.value)}>
                        <option value='ignore'>-- Add to Comments --</option>
                        {FILAMENT_FIELDS.map((field) => {
                          // Check if this field is used by ANOTHER header
                          const isUsedElsewhere =
                            usedFields.has(field.key) && mapping[header] !== field.key;

                          return (
                            <option
                              key={field.key}
                              value={field.key}
                              disabled={isUsedElsewhere}
                              style={isUsedElsewhere ? { color: '#ccc' } : {}}>
                              {field.label} {isUsedElsewhere ? '(Mapped)' : ''}
                            </option>
                          );
                        })}
                      </Form.Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </CustomModal>
  );
}
