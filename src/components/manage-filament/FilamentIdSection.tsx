import React, { useState } from 'react';
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

interface FilamentIdSectionProps {
  id: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FilamentIdSection({ id, onChange }: FilamentIdSectionProps) {
  const [isIdEditable, setIsIdEditable] = useState(false);

  const handleEnableIdEdit = () => {
    if (
      window.confirm(
        'Are you sure you want to edit the ID? \n\nChanging the ID manually can break links or create duplicate records.'
      )
    ) {
      setIsIdEditable(true);
    }
  };

  if (!id && !isIdEditable) return null; // Or render empty if new form logic differs

  return (
    <Form.Group as={Row} className='mb-3 align-items-center' controlId='_id'>
      <Form.Label column sm='auto' className='mb-0'>
        ID:
      </Form.Label>
      <Col>
        <InputGroup>
          <Form.Control
            type='text'
            name='_id'
            value={id || ''}
            onChange={onChange}
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
  );
}
