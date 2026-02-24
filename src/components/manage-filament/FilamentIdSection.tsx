// --- React ---
import React, { useState, useEffect } from 'react';
// --- Components ---
import { Form, Row, Col, InputGroup, Button, Modal } from 'react-bootstrap';
import { QRCodeSVG } from 'qrcode.react';
// --- Icons ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPen,
  faExclamationTriangle,
  faQrcode,
  faCopy,
  faDownload,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';

interface FilamentIdSectionProps {
  id: string | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FilamentIdSection({ id, onChange }: FilamentIdSectionProps) {
  const [isIdEditable, setIsIdEditable] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [qrUrl, setQrUrl] = useState('');

  useEffect(() => {
    if (id) {
      const baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        (typeof window !== 'undefined' ? window.location.origin : '');
      const cleanBaseUrl = baseUrl.replace(/\/$/, '');
      setQrUrl(`${cleanBaseUrl}/manage-filament?id=${id}`);
    }
  }, [id]);

  const handleEnableIdEdit = () => {
    if (
      window.confirm(
        'Are you sure you want to edit the ID? \n\nChanging the ID manually can break links or create duplicate records.'
      )
    ) {
      setIsIdEditable(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleDownloadQrSvg = () => {
    const svg = document.getElementById('filament-qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `FilaMeter-QR-${id}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!id && !isIdEditable) return null;

  return (
    <>
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
              <>
                <Button variant='outline-secondary' onClick={handleEnableIdEdit} title='Edit ID'>
                  <FontAwesomeIcon icon={faPen} size='sm' />
                </Button>
                {id && (
                  <Button
                    variant='outline-primary'
                    onClick={() => setShowQrModal(true)}
                    title='View QR Code'>
                    <FontAwesomeIcon icon={faQrcode} size='sm' />
                  </Button>
                )}
              </>
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

      <Modal show={showQrModal} onHide={() => setShowQrModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Spool QR Code</Modal.Title>
        </Modal.Header>
        <Modal.Body className='text-center py-4'>
          <div className='mb-4 d-flex justify-content-center'>
            <div className='p-3 bg-white border rounded shadow-sm d-inline-block'>
              <QRCodeSVG
                id='filament-qr-code'
                value={qrUrl}
                size={200}
                level='H'
                marginSize={4}
                fgColor='#000000'
                bgColor='#FFFFFF'
              />
            </div>
          </div>
          <p className='text-muted small mb-4'>
            Scan this code to quickly access and edit this specific spool in FilaMeter.
          </p>
          <div className='d-flex justify-content-center gap-3'>
            <Button variant='outline-secondary' onClick={handleCopyLink}>
              <FontAwesomeIcon icon={copied ? faCheck : faCopy} className='me-2' />
              {copied ? 'Copied!' : 'Copy Link'}
            </Button>
            <Button variant='primary' onClick={handleDownloadQrSvg}>
              <FontAwesomeIcon icon={faDownload} className='me-2' />
              Download SVG
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}
