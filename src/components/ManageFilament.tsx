'use client';

// --- React ---
import React from 'react';
import { Form, Button, Spinner } from 'react-bootstrap';
// --- Components ---
import { CustomAlert } from '@silocitypages/ui-core';
import FilamentIdSection from '@/components/manage-filament/FilamentIdSection';
import FilamentAttributes from '@/components/manage-filament/FilamentAttributes';
import UsageHistory from '@/components/manage-filament/UsageHistory';
// --- Hooks ---
import { useManageFilamentForm } from '@/hooks/useManageFilamentForm';
// --- Styles ---
import styles from '@/public/styles/components/ManageFilament.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faTimes, faTrash } from '@fortawesome/free-solid-svg-icons';
// --- Types ---
import { ManageFilamentProps } from '@/types/Filament';

function ManageFilament({ data, db }: ManageFilamentProps) {
  const {
    formData,
    isEdit,
    isSaving,
    isDeleting,
    hideMultiple,
    createMultiple,
    numberOfRows,
    alert,
    setAlert,
    setCreateMultiple,
    setNumberOfRows,
    handleInputChange,
    handleTypeaheadChange,
    handleColorPickerChange,
    handleDelete,
    handleSubmit,
    validateColor,
    handleLogAdd,
    handleLogUpdate,
    handleLogDelete,
  } = useManageFilamentForm(data, db);

  return (
    <>
      <CustomAlert
        variant={alert.variant}
        message={alert.message}
        show={alert.show}
        onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
      />

      <Form onSubmit={handleSubmit} className={styles.manageForm}>
        {/* --- ID Section --- */}
        {formData._id && <FilamentIdSection id={formData._id} onChange={handleInputChange} />}

        {/* --- Main Attributes --- */}
        <FilamentAttributes
          formData={formData}
          isEdit={isEdit}
          onInputChange={handleInputChange}
          onTypeaheadChange={handleTypeaheadChange}
          onColorPickerChange={handleColorPickerChange}
          validateColor={validateColor}
        />

        {/* --- Usage History (Only show for existing items) --- */}
        {formData._id && (
          <UsageHistory
            history={formData.usage_history || []}
            onAdd={handleLogAdd}
            onEdit={handleLogUpdate}
            onDelete={handleLogDelete}
          />
        )}

        <hr className='my-4' />

        {/* --- Comments --- */}
        <Form.Group className='mb-3' controlId='comments'>
          <Form.Label>Comments</Form.Label>
          <Form.Control
            as='textarea'
            rows={3}
            name='comments'
            value={(formData.comments as string) || ''}
            onChange={handleInputChange}
            placeholder='e.g., Prints best at 215°C'
          />
        </Form.Group>

        {/* --- Bulk Create Options --- */}
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

        {/* --- Action Buttons --- */}
        <div className='mt-4 d-flex justify-content-end gap-2'>
          {isEdit && (
            <Button variant='danger' onClick={handleDelete} disabled={isDeleting || isSaving}>
              <FontAwesomeIcon icon={faTrash} className='me-2' />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}

          <Button href='/spools' variant='outline-secondary' className='ms-auto'>
            <FontAwesomeIcon icon={faTimes} className='me-2' />
            {isEdit ? 'Back to Spools' : 'Cancel'}
          </Button>

          <Button variant='primary' type='submit' disabled={isSaving || isDeleting}>
            <FontAwesomeIcon icon={faSave} className='me-2' />
            {isSaving ? <Spinner as='span' size='sm' /> : 'Save Filament'}
          </Button>
        </div>
      </Form>
    </>
  );
}

export default ManageFilament;
