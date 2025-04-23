// --- React ---
import React from "react";
import { Modal, Button } from "react-bootstrap";

interface ModalProps {
  variant: string;
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  title: string;
  children: React.ReactNode;
}

const CustomModal: React.FC<ModalProps> = ({
  variant,
  show,
  onClose,
  onSave,
  title,
  children,
}) => {
  return (
    <Modal show={show} onHide={onClose}>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant={variant} onClick={onSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;
