// --- React ---
import React from "react";
import { Alert } from "react-bootstrap";

interface AlertProps {
  variant: string;
  message: string;
  show: boolean;
  onClose: () => void;
}

const CustomAlert: React.FC<AlertProps> = ({
  variant,
  message,
  show,
  onClose,
}) => {
  if (!show) {
    return null; // Don't render if not shown
  }

  return (
    <Alert variant={variant} onClose={onClose} dismissible>
      {message}
    </Alert>
  );
};

export default CustomAlert;
