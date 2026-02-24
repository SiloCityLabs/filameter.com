// --- React ---
import React, { useState, useMemo } from 'react';

// --- Components ---
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ColorPicker, useColor } from 'react-color-palette';

// --- Icons ---
import { faPen } from '@fortawesome/free-solid-svg-icons';

// --- Data ---
import { vendors } from '@/data/vendors';
import { materials } from '@/data/materials';

// --- Types ---
import { Filament } from '@/types/Filament';

// --- Styles ---
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-color-palette/css';

interface FilamentAttributesProps {
  formData: Filament & Record<string, unknown>;
  isEdit: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTypeaheadChange: (field: keyof Filament, selected: { label: string }[] | string[]) => void;
  onColorPickerChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validateColor: (color: string) => boolean;
}

// Wrapper component to isolate the `useColor` hook and keep it perfectly synced
// with the parent state whenever the dropdown is opened.
const ColorPickerDropdown = ({
  colorHex,
  onChange,
  onClose,
}: {
  colorHex: string;
  onChange: (hex: string) => void;
  onClose: () => void;
}) => {
  const [color, setColor] = useColor(colorHex);

  const handleChange = (newColor: any) => {
    setColor(newColor);
    onChange(newColor.hex.toLowerCase());
  };

  return (
    <div style={{ position: 'absolute', zIndex: 1050, marginTop: '0.5rem' }}>
      <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0 }} onClick={onClose} />
      <div style={{ position: 'relative', width: '250px' }}>
        <ColorPicker hideInput={['rgb', 'hsv']} color={color} onChange={handleChange} />
      </div>
    </div>
  );
};

export default function FilamentAttributes({
  formData,
  isEdit,
  onInputChange,
  onTypeaheadChange,
  onColorPickerChange,
  validateColor,
}: FilamentAttributesProps) {
  const [isManualOverride, setIsManualOverride] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  // Pick a random vibrant color once when the component mounts.
  // CRITICAL: Must be lowercase for Android Chrome's custom sliders to parse correctly.
  const defaultPickerColor = useMemo(() => {
    const brightColors = [
      '#ff0000', // Red
      '#00ff00', // Green
      '#0000ff', // Blue
      '#ffff00', // Yellow
      '#00ffff', // Cyan
      '#ff00ff', // Magenta
      '#ffa500', // Orange
    ];
    const randomIndex = Math.floor(Math.random() * brightColors.length);
    return brightColors[randomIndex];
  }, []);

  const getNormalizedColorForPicker = (color: string | undefined) => {
    if (!color) return defaultPickerColor;

    let normalized = color.trim();

    // Handle 3-character hex shorthand (e.g. #F00 -> #FF0000)
    const match = normalized.match(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/i);
    if (match) {
      normalized = `#${match[1]}${match[1]}${match[2]}${match[2]}${match[3]}${match[3]}`;
    } else if (!normalized.startsWith('#')) {
      normalized = `#${normalized}`;
    }

    // If it's not a valid 7-character hex after attempts, fallback to prevent mobile crash
    if (!/^#[0-9a-f]{6}$/i.test(normalized)) {
      return defaultPickerColor;
    }

    // CRITICAL: Ensure lowercase formatting
    return normalized.toLowerCase();
  };

  const handleColorBoxClick = () => {
    // If there is no color set yet, default it to the random bright color when the picker is opened
    if (!formData.color) {
      const syntheticEvent = {
        target: { name: 'color', value: defaultPickerColor },
        currentTarget: { name: 'color', value: defaultPickerColor },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onColorPickerChange(syntheticEvent);
    }
    setShowColorPicker(!showColorPicker);
  };

  const handlePickerChange = (hex: string) => {
    const syntheticEvent = {
      target: { name: 'color', value: hex },
      currentTarget: { name: 'color', value: hex },
    } as unknown as React.ChangeEvent<HTMLInputElement>;

    onColorPickerChange(syntheticEvent);
  };

  const handleManualOverrideClick = () => {
    if (
      window.confirm(
        '⚠ Warning: Editing the Used Weight manually will desync it from your Usage History logs.\n\nAre you sure you want to proceed?'
      )
    ) {
      setIsManualOverride(true);
    }
  };

  return (
    <>
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
              onChange={(s) => onTypeaheadChange('brand', s as string[])}
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
              onChange={(s) => onTypeaheadChange('material', s as string[])}
              onInputChange={(text) => onTypeaheadChange('material', text ? [{ label: text }] : [])}
              selected={formData.material ? [formData.material] : []}
              inputProps={{ required: true }}
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='color'>
            <Form.Label>Color (Hex)</Form.Label>
            <div style={{ position: 'relative' }}>
              <InputGroup>
                <InputGroup.Text
                  onClick={handleColorBoxClick}
                  style={{
                    backgroundColor: getNormalizedColorForPicker(formData.color as string),
                    cursor: 'pointer',
                    width: '50px',
                    border: '1px solid #dee2e6',
                    padding: 0,
                  }}
                  title='Click to choose a color'
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

              {showColorPicker && (
                <ColorPickerDropdown
                  colorHex={getNormalizedColorForPicker(formData.color as string)}
                  onChange={handlePickerChange}
                  onClose={() => setShowColorPicker(false)}
                />
              )}
            </div>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='usedWeight'>
            <Form.Label>Used Weight (g)</Form.Label>
            <InputGroup>
              <Form.Control
                type='number'
                name='used_weight'
                value={
                  typeof formData.used_weight === 'number'
                    ? Number(formData.used_weight.toFixed(2))
                    : formData.used_weight
                }
                onChange={onInputChange}
                min='0'
                step='0.01'
                required
                readOnly={isEdit && !isManualOverride}
                className={isEdit && !isManualOverride ? 'bg-light' : ''}
                title={
                  isEdit && !isManualOverride
                    ? 'Calculated from Usage History. Click edit icon to override.'
                    : ''
                }
              />
              {isEdit && !isManualOverride && (
                <Button
                  variant='outline-secondary'
                  onClick={handleManualOverrideClick}
                  title='Manually override used weight (Not Recommended)'>
                  <FontAwesomeIcon icon={faPen} size='sm' />
                </Button>
              )}
            </InputGroup>
            {isEdit && !isManualOverride && (
              <Form.Text className='text-muted small'>Calculated from usage logs.</Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='totalWeight'>
            <Form.Label>Total Weight (g)</Form.Label>
            <Form.Control
              type='number'
              name='total_weight'
              value={
                typeof formData.total_weight === 'number'
                  ? Number(formData.total_weight.toFixed(2))
                  : formData.total_weight
              }
              onChange={onInputChange}
              min='0'
              step='0.01'
              required
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col md={6}>
          <Form.Group className='mb-3' controlId='price'>
            <Form.Label>Price</Form.Label>
            <InputGroup>
              <InputGroup.Text>$</InputGroup.Text>
              <Form.Control
                type='number'
                name='price'
                value={
                  typeof formData.price === 'number'
                    ? Number(formData.price.toFixed(2))
                    : formData.price
                }
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
