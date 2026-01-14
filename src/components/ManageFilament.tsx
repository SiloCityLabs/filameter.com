'use client';

// --- React ---
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Spinner, InputGroup } from 'react-bootstrap';
// --- Next ---
import { useRouter } from 'next/navigation';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
// --- Helpers ---
import { save, deleteRow } from '@silocitypages/data-access';
import { filamentSchema } from '@/helpers/database/filament/migrateFilamentDB';
// --- Styles ---
import styles from '@/public/styles/components/ManageFilament.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faPen, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
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

  // Use intersection type to allow unknown legacy fields (like 'color') without using 'any'
  const [formData, setFormData] = useState<Filament & Record<string, unknown>>(
    data && Object.keys(data).length > 0 ? data : defaultValue
  );

  const [createMultiple, setCreateMultiple] = useState(false);
  const [numberOfRows, setNumberOfRows] = useState(2);

  // --- New State for ID Editing ---
  const [isIdEditable, setIsIdEditable] = useState(false);

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

  const handleEnableIdEdit = () => {
    const confirmEdit = window.confirm(
      'Are you sure you want to edit the ID? \n\nChanging the ID manually can break links or create duplicate records if not handled carefully. Only do this if you know what you are doing.'
    );
    if (confirmEdit) {
      setIsIdEditable(true);
    }
  };

  const validateId = (id: string): boolean => {
    // Regex for standard UUID (case insensitive)
    const uuidRegex =
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    // Regex for FilaMeter QR Code (Alphanumeric, EXACTLY 8 characters)
    const qrRegex = /^[a-zA-Z0-9]{8}$/;

    return uuidRegex.test(id) || qrRegex.test(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) {
      setAlertVariant('danger');
      setAlertMessage('Database not initialized.');
      setShowAlert(true);
      return;
    }

    // --- ID Validation ---
    if (formData._id && !validateId(formData._id)) {
      setAlertVariant('danger');
      setAlertMessage(
        'Invalid ID Format. ID must be a valid UUID or a FilaMeter QR Code (exactly 8 alphanumeric characters).'
      );
      setShowAlert(true);
      return;
    }

    setIsSaving(true);

    // Check if ID changed. If so, we treat it as an insert (new ID) and delete the old one.
    const isIdChanged = data?._id && formData._id !== data._id;
    const finalOperationIsEdit = isEdit && !isIdChanged;
    const type = finalOperationIsEdit ? 'updated' : 'added';

    let finalResult;
    try {
      for (let x = 0; x < (createMultiple && !finalOperationIsEdit ? numberOfRows : 1); x++) {
        // 1. Prepare base data
        let dataToSave = { ...formData };

        if (createMultiple && !finalOperationIsEdit) {
          // Creating multiple new entries (ignore ID and Rev)
          dataToSave = { ...formData, _id: undefined, _rev: undefined };
        } else if (isIdChanged) {
          // ID was manually changed; treat as new record (strip _rev)
          // This creates the NEW record.
          dataToSave = { ...formData, _rev: undefined };
        }

        // 2. Sanitize Data: Strip unknown fields (like 'color') that fail schema validation
        // We explicitly construct the object to ensure only valid fields are passed.
        const sanitizedData = {
          filament: dataToSave.filament,
          material: dataToSave.material,
          used_weight: Number(dataToSave.used_weight),
          total_weight: Number(dataToSave.total_weight),
          location: (dataToSave.location as string) || '',
          comments: (dataToSave.comments as string) || '',
          // Conditionally add _id and _rev if they exist
          ...(dataToSave._id ? { _id: dataToSave._id } : {}),
          ...(dataToSave._rev ? { _rev: dataToSave._rev } : {}),
        };

        // 3. Save
        finalResult = await save(db, sanitizedData, filamentSchema, 'filament');
        if (!finalResult.success) {
          // Pass the error up to the catch block
          throw new Error(JSON.stringify(finalResult.error));
        }
      }

      // If ID was changed and the new save was successful, DELETE the old record.
      if (isIdChanged && data?._id && finalResult?.success) {
        const deleteSuccess = await deleteRow(db, data._id, 'filament');
        if (!deleteSuccess) {
          console.warn('Failed to delete the old filament record after creating the new one.');
        }
      }

      // If the save was successful, update the last modified timestamp.
      if (finalResult?.success) {
        await updateLastModified();
      }

      const successMessageText = finalOperationIsEdit
        ? 'Filament updated successfully'
        : isIdChanged
          ? 'Filament ID updated successfully'
          : createMultiple
            ? `${numberOfRows} filament added successfully`
            : 'Filament added successfully';

      const successMessage = encodeURIComponent(successMessageText);
      router.push(`/spools?alert_msg=${successMessage}`);
    } catch (error: unknown) {
      console.error(`Error: Filament not ${type}:`, error);
      let message = 'An unexpected error occurred.';
      if (error instanceof Error) {
        try {
          const errorObj = JSON.parse(error.message);
          if (Array.isArray(errorObj)) {
            // Check specifically for Joi validation errors (which return arrays)
            const validationMessages = errorObj
              .map((eItem: { message: string }) => eItem.message)
              .join(', ');
            message = `Validation Error: ${validationMessages}`;
          } else {
            // Handle plain string errors returned from DB (like 'Document update conflict')
            message = String(errorObj);
          }
        } catch (_e) {
          message = error.message || message;
        }
      } else if (typeof error === 'string') {
        message = error;
      }

      // --- GRACEFUL CONFLICT HANDLING ---
      // Check for the specific PouchDB/CouchDB 409 Conflict message
      if (message && message.toLowerCase().includes('document update conflict')) {
        message = `A filament with the ID "${formData._id}" already exists. IDs must be unique.`;
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
        {/* Only show ID field if it exists (Edit Mode) or if user manually populated it via URL */}
        {formData._id && (
          <Form.Group as={Row} className='mb-3 align-items-center' controlId='_id'>
            <Form.Label column sm='auto' className='mb-0'>
              ID:
            </Form.Label>
            <Col>
              <InputGroup>
                <Form.Control
                  type='text'
                  name='_id'
                  value={formData._id}
                  onChange={handleInputChange}
                  disabled={!isIdEditable}
                  readOnly={!isIdEditable}
                  className={isIdEditable ? 'bg-white' : ''}
                />
                {!isIdEditable && (
                  <Button variant='outline-secondary' onClick={handleEnableIdEdit} title='Edit ID'>
                    <FontAwesomeIcon icon={faPen} size='sm' />
                  </Button>
                )}
                {isIdEditable && (
                  <InputGroup.Text className='text-warning'>
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  </InputGroup.Text>
                )}
              </InputGroup>
              {isIdEditable && (
                <Form.Text className='text-muted'>
                  Allowed formats: UUID or 8 character alphanumeric code.
                </Form.Text>
              )}
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
            value={formData.location as string}
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
            value={formData.comments as string}
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
