'use client';

// --- React ---
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner } from 'react-bootstrap';
// --- Next ---
import { useRouter } from 'next/navigation';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
// --- Helpers ---
import { save } from '@silocitypages/data-access';
import { filamentSchema } from '@/helpers/database/filament/migrateFilamentDB';
// --- Styles ---
import styles from '@/public/styles/components/ManageFilament.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes } from '@fortawesome/free-solid-svg-icons';
// --- Hooks ---
import { useSync } from '@/hooks/useSync';
// --- Types ---
import { ManageFilamentProps, Filament } from '@/types/Filament';

const defaultValue: Filament = {
  filament: '',
  material: '',
  used_weight: 0,
  total_weight: 1000,
  location: '',
  comments: '',
};

function ManageFilament({ data, db }: ManageFilamentProps) {
  const router = useRouter();
  const { updateLastModified } = useSync('');
  const [isEdit, setIsEdit] = useState(false);
  const [hideMultiple, setHideMultiple] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [formData, setFormData] = useState(
    data && Object.keys(data).length > 0 ? data : defaultValue
  );
  const [createMultiple, setCreateMultiple] = useState(false);
  const [numberOfRows, setNumberOfRows] = useState(2);

  useEffect(() => {
    if (data?._id) {
      setHideMultiple(true);
      if (data?._rev) {
        setIsEdit(true);
      }
    }
  }, [data?._id, data?._rev]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setAlertVariant('danger');
      setAlertMessage('Database not initialized.');
      setShowAlert(true);
      return;
    }

    setIsSaving(true);
    const type = isEdit ? 'updated' : 'added';
    let finalResult;
    try {
      for (let x = 0; x < (createMultiple && !isEdit ? numberOfRows : 1); x++) {
        const dataToSave =
          createMultiple && !isEdit ? { ...formData, _id: undefined, _rev: undefined } : formData;
        finalResult = await save(db, dataToSave, filamentSchema, 'filament');
        if (!finalResult.success) {
          throw new Error(JSON.stringify(finalResult.error));
        }
      }

      // If the save was successful, update the last modified timestamp.
      if (finalResult?.success) {
        await updateLastModified();
      }

      const successMessageText = isEdit
        ? 'Filament updated successfully'
        : createMultiple
          ? `${numberOfRows} filament added successfully`
          : 'Filament added successfully';

      const successMessage = encodeURIComponent(successMessageText);
      router.push(`/spools?alert_msg=${successMessage}`);
    } catch (error: unknown) {
      console.error(`Error: Filament not ${type}:`, error);
      let message = 'An unexpected error occurred.';
      if (error instanceof Error) {
        // Type guard to check if it's an Error instance
        try {
          const errorObj = JSON.parse(error.message);
          if (Array.isArray(errorObj)) {
            message = errorObj.map((eItem: { message: string }) => eItem.message).join(', '); // Add type for eItem
          }
        } catch (_e) {
          // Prefix with underscore to mark as intentionally unused
          message = error.message || message;
        }
      } else if (typeof error === 'string') {
        message = error;
      }
      setAlertMessage(message);
      setAlertVariant('danger');
      setShowAlert(true);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <CustomAlert
        variant={alertVariant || 'success'}
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      />
      <Form onSubmit={handleSubmit} className={styles.manageForm}>
        {formData._id && (
          <Form.Group as={Row} className='mb-3 align-items-center' controlId='_id'>
            <Form.Label column sm='auto' className='mb-0'>
              ID:
            </Form.Label>
            <Col>
              <Form.Control type='text' value={formData._id} disabled readOnly />
            </Col>
          </Form.Group>
        )}

        <Row>
          <Col md={6}>
            <Form.Group className='mb-3' controlId='filament'>
              <Form.Label>Filament Name</Form.Label>
              <Form.Control
                type='text'
                name='filament'
                value={formData.filament}
                onChange={handleInputChange}
                placeholder='e.g., Galaxy Black'
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className='mb-3' controlId='material'>
              <Form.Label>Material</Form.Label>
              <Form.Control
                type='text'
                name='material'
                value={formData.material}
                onChange={handleInputChange}
                placeholder='e.g., PLA'
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Form.Group className='mb-3' controlId='usedWeight'>
              <Form.Label>Used Weight (g)</Form.Label>
              <Form.Control
                type='number'
                name='used_weight'
                value={formData.used_weight}
                onChange={handleInputChange}
                min='0'
                required
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className='mb-3' controlId='totalWeight'>
              <Form.Label>Total Weight (g)</Form.Label>
              <Form.Control
                type='number'
                name='total_weight'
                value={formData.total_weight}
                onChange={handleInputChange}
                min='0'
                required
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className='mb-3' controlId='location'>
          <Form.Label>Location</Form.Label>
          <Form.Control
            type='text'
            name='location'
            value={formData.location}
            onChange={handleInputChange}
            placeholder='e.g., Shelf A, Bin 3'
          />
        </Form.Group>

        <Form.Group className='mb-3' controlId='comments'>
          <Form.Label>Comments</Form.Label>
          <Form.Control
            as='textarea'
            rows={3}
            name='comments'
            value={formData.comments}
            onChange={handleInputChange}
            placeholder='e.g., Prints best at 215°C'
          />
        </Form.Group>

        {!hideMultiple && (
          <Form.Group controlId='createMultiple' className={styles.multipleOptionWrapper}>
            <Form.Check
              type='checkbox'
              label='Create multiple spools with these details'
              checked={createMultiple}
              className={styles.formCheck}
              onChange={(e) => setCreateMultiple(e.target.checked)}
            />
          </Form.Group>
        )}

        {createMultiple && !hideMultiple && (
          <Form.Group className='mb-3' controlId='numberOfRows'>
            <Form.Label>Number of spools to create:</Form.Label>
            <Form.Control
              type='number'
              value={numberOfRows}
              onChange={(e) => setNumberOfRows(parseInt(e.target.value))}
              min={2}
              max={50}
            />
          </Form.Group>
        )}

        <div className='mt-4 d-flex justify-content-end gap-2'>
          <Button href='/spools' variant='outline-secondary'>
            <FontAwesomeIcon icon={faTimes} className='me-2' />
            {isEdit ? 'Back to Spools' : 'Cancel'}
          </Button>
          <Button variant='primary' type='submit' disabled={isSaving}>
            <FontAwesomeIcon icon={faSave} className='me-2' />
            {isSaving ? <Spinner as='span' size='sm' /> : 'Save Filament'}
          </Button>
        </div>
      </Form>
    </>
  );
}

export default ManageFilament;
