'use client';

import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
// --- Next ---
import { useRouter } from 'next/navigation';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
// --- Types ---
import { ManageFilamentProps, Filament } from '@/types/Filament';
// --- DB ---
import { save } from '@/helpers/_silabs/pouchDb/save';
import { filamentSchema } from '@/helpers/database/filament/migrateFilamentDB';

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
  const [isEdit, setIsEdit] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [formData, setFormData] = useState(
    data && Object.keys(data).length > 0 ? data : defaultValue
  );
  const [createMultiple, setCreateMultiple] = useState(false);
  const [numberOfRows, setNumberOfRows] = useState(1);

  useEffect(() => {
    if (data?._id && data?._rev) {
      setIsEdit(true);
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

    const type = isEdit ? 'updated' : 'added';
    let result;
    for (let x = 0; x < numberOfRows; x++) {
      result = await save(db, formData, filamentSchema, 'filament');
    }

    if (result.success) {
      setShowAlert(true);
      setAlertMessage(`Filament ${type} successfully`);

      //Clear form data if adding
      if (!isEdit) {
        router.replace('/spools');
      }
    } else {
      console.error(`Error: Filament not ${type}:`, result.error);
      if (
        typeof result.error === 'object' &&
        result.error !== null &&
        Array.isArray(result.error)
      ) {
        result.error.forEach((err) => {
          setAlertMessage(err.message);
        });
        setAlertVariant('danger');
        setShowAlert(true);
      } else {
        setAlertVariant('danger');
        setAlertMessage('An unexpected error occurred.');
        setShowAlert(true);
      }
    }
  };

  return (
    <>
      <CustomAlert
        variant={alertVariant ? alertVariant : 'success'}
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      />
      <Form onSubmit={handleSubmit}>
        {formData._id && (
          <Form.Group controlId='_id'>
            <Form.Label>ID:</Form.Label>
            <Form.Control type='text' name='_id' value={formData._id} disabled={true} />
          </Form.Group>
        )}

        <Form.Group controlId='filament'>
          <Form.Label>Filament:</Form.Label>
          <Form.Control
            type='text'
            name='filament'
            value={formData.filament}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group controlId='material'>
          <Form.Label>Material:</Form.Label>
          <Form.Control
            type='text'
            name='material'
            value={formData.material}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId='usedWeight'>
          <Form.Label>Used Weight:</Form.Label>
          <Form.Control
            type='number'
            name='used_weight'
            value={formData.used_weight}
            onChange={handleInputChange}
            min='0'
            required
          />
        </Form.Group>

        <Form.Group controlId='totalWeight'>
          <Form.Label>Total Weight:</Form.Label>
          <Form.Control
            type='number'
            name='total_weight'
            value={formData.total_weight}
            onChange={handleInputChange}
            min='0'
            required
          />
        </Form.Group>

        <Form.Group controlId='location'>
          <Form.Label>Location:</Form.Label>
          <Form.Control
            type='text'
            name='location'
            value={formData.location}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group controlId='comments'>
          <Form.Label>Comments:</Form.Label>
          <Form.Control
            as='textarea' // Use textarea component
            rows={3} // Set number of rows
            name='comments'
            value={formData.comments}
            onChange={handleInputChange}
          />
        </Form.Group>
        {!isEdit && (
          <Form.Group controlId='createMultiple'>
            <Form.Check
              type='checkbox'
              label='Create multiple rows'
              checked={createMultiple}
              className='custom-checkbox my-3'
              onChange={(e) => setCreateMultiple(e.target.checked)}
            />
          </Form.Group>
        )}

        {createMultiple && !isEdit && (
          <Form.Group controlId='numberOfRows'>
            <Form.Label>Number of rows:</Form.Label>
            <Form.Control
              type='number'
              value={numberOfRows}
              onChange={(e) => setNumberOfRows(parseInt(e.target.value))}
              min={1}
              max={50}
            />
          </Form.Group>
        )}

        <div className='text-center mt-2 d-flex justify-content-center'>
          <Button href='/spools' variant='primary' className='me-2'>
            {isEdit ? 'Back to Spools' : 'Cancel'}
          </Button>
          <Button variant='primary' type='submit'>
            Save
          </Button>
        </div>
      </Form>
    </>
  );
}

export default ManageFilament;
