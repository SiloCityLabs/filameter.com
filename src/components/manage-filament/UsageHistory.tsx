import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Row, Col, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faHistory } from '@fortawesome/free-solid-svg-icons';
import { UsageLog } from '@/types/Filament';
import { v4 as uuidv4 } from 'uuid';

interface UsageHistoryProps {
  history: UsageLog[];
  onAdd: (log: UsageLog) => void;
  onEdit: (log: UsageLog) => void;
  onDelete: (id: string) => void;
}

const emptyLog: UsageLog = {
  id: '',
  date: '',
  weight: 0,
  printName: '',
  status: 'success',
  notes: '',
};

export default function UsageHistory({ history = [], onAdd, onEdit, onDelete }: UsageHistoryProps) {
  const [showModal, setShowModal] = useState(false);
  const [editingLog, setEditingLog] = useState<UsageLog>(emptyLog);
  const [isEditMode, setIsEditMode] = useState(false);
  const [validated, setValidated] = useState(false);

  // Reset validation when modal opens/closes
  useEffect(() => {
    if (showModal) {
      setValidated(false);
    }
  }, [showModal]);

  const handleShowAdd = () => {
    setEditingLog({
      ...emptyLog,
      id: uuidv4(),
      date: new Date().toISOString().slice(0, 16), // Default to current time for datetime-local
    });
    setIsEditMode(false);
    setShowModal(true);
  };

  const handleShowEdit = (log: UsageLog) => {
    setEditingLog({
      ...log,
      date: log.date ? log.date.slice(0, 16) : '', // Format for input
    });
    setIsEditMode(true);
    setShowModal(true);
  };

  const isWeightValid = (weight: number) => {
    return !isNaN(weight) && weight >= 0;
  };

  const isFormValid = () => {
    return (
      editingLog.printName &&
      editingLog.printName.trim().length > 0 &&
      isWeightValid(editingLog.weight) &&
      editingLog.date
    );
  };

  const handleSave = () => {
    setValidated(true);

    if (!isFormValid()) {
      return;
    }

    const logToSave = {
      ...editingLog,
      date: new Date(editingLog.date).toISOString(), // Ensure ISO format on save
      printName: editingLog.printName?.trim() || '', // Ensure it's trimmed
    };

    if (isEditMode) {
      onEdit(logToSave);
    } else {
      onAdd(logToSave);
    }
    setShowModal(false);
  };

  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className='mt-4'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h5 className='mb-0'>
          <FontAwesomeIcon icon={faHistory} className='me-2 text-secondary' />
          Usage History
        </h5>
        <Button variant='outline-primary' size='sm' onClick={handleShowAdd}>
          <FontAwesomeIcon icon={faPlus} className='me-2' />
          Log Print
        </Button>
      </div>

      {history.length === 0 ? (
        <p className='text-muted fst-italic'>No usage history recorded yet.</p>
      ) : (
        <div className='table-responsive'>
          <Table hover size='sm' className='align-middle'>
            <thead className='table-light'>
              <tr>
                <th>Date</th>
                <th>Print Name</th>
                <th>Status</th>
                <th className='text-end'>Weight (g)</th>
                <th className='text-end'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedHistory.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.date).toLocaleDateString()}</td>
                  <td>
                    {log.printName || <span className='text-muted'>-</span>}
                    {log.notes && (
                      <div className='small text-muted text-truncate' style={{ maxWidth: '200px' }}>
                        {log.notes}
                      </div>
                    )}
                  </td>
                  <td>
                    <Badge bg={log.status === 'success' ? 'success' : 'danger'}>{log.status}</Badge>
                  </td>
                  <td className='text-end'>{log.weight}g</td>
                  <td className='text-end'>
                    <Button
                      variant='link'
                      className='p-0 me-2 text-secondary'
                      onClick={() => handleShowEdit(log)}
                      title='Edit'>
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant='link'
                      className='p-0 text-danger'
                      onClick={() => {
                        if (
                          confirm('Delete this log entry? It will correct the total used weight.')
                        ) {
                          onDelete(log.id);
                        }
                      }}
                      title='Delete'>
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}

      {/* --- Log Modal --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Usage Log' : 'Log Print Usage'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated}>
            <Row className='mb-3'>
              <Col md={6}>
                <Form.Group controlId='logDate'>
                  <Form.Label>Date & Time</Form.Label>
                  <Form.Control
                    type='datetime-local'
                    value={editingLog.date}
                    onChange={(e) => setEditingLog({ ...editingLog, date: e.target.value })}
                    required
                    isInvalid={validated && !editingLog.date}
                  />
                  <Form.Control.Feedback type='invalid'>Date is required.</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId='logWeight'>
                  <Form.Label>Weight Used (g)</Form.Label>
                  <Form.Control
                    type='number'
                    min='0'
                    step='0.01'
                    value={editingLog.weight}
                    onChange={(e) =>
                      setEditingLog({ ...editingLog, weight: parseFloat(e.target.value) })
                    }
                    required
                    isInvalid={validated && !isWeightValid(editingLog.weight)}
                  />
                  <Form.Control.Feedback type='invalid'>
                    Must be a number ≥ 0.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className='mb-3' controlId='logPrintName'>
              <Form.Label>Print Name / Description</Form.Label>
              <Form.Control
                type='text'
                placeholder='e.g. Benchy'
                value={editingLog.printName}
                onChange={(e) => setEditingLog({ ...editingLog, printName: e.target.value })}
                required
                isInvalid={
                  validated && (!editingLog.printName || editingLog.printName.trim() === '')
                }
              />
              <Form.Control.Feedback type='invalid'>Print name is required.</Form.Control.Feedback>
            </Form.Group>

            <Form.Group className='mb-3' controlId='logStatus'>
              <Form.Label>Print Status</Form.Label>
              <div>
                <Form.Check
                  inline
                  type='radio'
                  label='Success'
                  name='status'
                  id='statusSuccess'
                  checked={editingLog.status === 'success'}
                  onChange={() => setEditingLog({ ...editingLog, status: 'success' })}
                />
                <Form.Check
                  inline
                  type='radio'
                  label='Failure'
                  name='status'
                  id='statusFailure'
                  checked={editingLog.status === 'failure'}
                  onChange={() => setEditingLog({ ...editingLog, status: 'failure' })}
                />
              </div>
            </Form.Group>

            <Form.Group className='mb-3' controlId='logNotes'>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as='textarea'
                rows={2}
                value={editingLog.notes}
                onChange={(e) => setEditingLog({ ...editingLog, notes: e.target.value })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant='secondary' onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant='primary' onClick={handleSave}>
            {isEditMode ? 'Update Log' : 'Add Log'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
