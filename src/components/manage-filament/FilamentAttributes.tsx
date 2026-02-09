import React from 'react';
import { Form, Row, Col, InputGroup } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { vendors } from '@/data/vendors';
import { materials } from '@/data/materials';
import { Filament } from '@/types/Filament';
import 'react-bootstrap-typeahead/css/Typeahead.css';

interface FilamentAttributesProps {
  formData: Filament & Record<string, unknown>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeaheadChange: (field: keyof Filament, selected: any[]) => void;
  onColorPickerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateColor: (color: string) => boolean;
}

export default function FilamentAttributes({
  formData,
  onInputChange,
  onTypeaheadChange,
  onColorPickerChange,
  validateColor,
}: FilamentAttributesProps) {
  const getNormalizedColorForPicker = (color: string | undefined) => {
    if (!color) return '#000000';
    const match = color.match(/^#([0-9A-F])([0-9A-F])([0-9A-F])$/i);
    if (match) {
      return `#${match[1]}${match[1]}${match[2]}${match[2]}${match[3]}${match[3]}`;
    }
    return color.startsWith('#') ? color : `#${color}`;
  };

  return (
    <>
      {/* Brand & Name */}
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='brand'>
            <Form.Label>Brand</Form.Label>
            <Typeahead
              id='brand-typeahead'
              allowNew
              clearButton
              options={vendors.map((v) => v.name)}
              placeholder='e.g., Creality'
              onChange={(s) => onTypeaheadChange('brand', s)}
              onInputChange={(text) => onTypeaheadChange('brand', text ? [{ label: text }] : [])}
              selected={formData.brand ? [formData.brand] : []}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='filament'>
            <Form.Label>Filament Name</Form.Label>
            <Form.Control
              type='text'
              name='filament'
              value={formData.filament}
              onChange={onInputChange}
              placeholder='e.g., Galaxy Black'
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Material & Color */}
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='material'>
            <Form.Label>Material</Form.Label>
            <Typeahead
              id='material-typeahead'
              allowNew
              clearButton
              options={materials.map((m) => m.name)}
              placeholder='e.g., PLA+'
              onChange={(s) => onTypeaheadChange('material', s)}
              onInputChange={(text) => onTypeaheadChange('material', text ? [{ label: text }] : [])}
              selected={formData.material ? [formData.material] : []}
              inputProps={{ required: true }}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='color'>
            <Form.Label>Color (Hex)</Form.Label>
            <InputGroup>
              <Form.Control
                type='color'
                value={getNormalizedColorForPicker(formData.color as string)}
                onChange={onColorPickerChange}
                title='Choose a color'
                style={{ maxWidth: '50px', padding: '5px', cursor: 'pointer' }}
              />
              <Form.Control
                type='text'
                name='color'
                value={(formData.color as string) || ''}
                onChange={onInputChange}
                placeholder='#000000'
                isInvalid={!!formData.color && !validateColor(formData.color as string)}
                maxLength={7}
              />
              <Form.Control.Feedback type='invalid'>
                Must be Hex (e.g. #FF0000)
              </Form.Control.Feedback>
            </InputGroup>
          </Form.Group>
        </Col>
      </Row>

      {/* Weights */}
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='usedWeight'>
            <Form.Label>Used Weight (g)</Form.Label>
            <Form.Control
              type='number'
              name='used_weight'
              value={formData.used_weight}
              onChange={onInputChange}
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
              onChange={onInputChange}
              min='0'
              required
            />
          </Form.Group>
        </Col>
      </Row>

      {/* Price & Location */}
      <Row>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='price'>
            <Form.Label>Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type='number'
                name='price'
                value={formData.price}
                onChange={onInputChange}
                min='0'
                step='0.01'
                placeholder='0.00'
              />
            </InputGroup>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='location'>
            <Form.Label>Location</Form.Label>
            <Form.Control
              type='text'
              name='location'
              value={(formData.location as string) || ''}
              onChange={onInputChange}
              placeholder='e.g., Shelf A, Bin 3'
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}
