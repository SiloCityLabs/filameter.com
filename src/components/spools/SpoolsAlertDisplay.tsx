'use client';

import React from 'react';
import { Col, Row } from 'react-bootstrap';
import { CustomAlert } from '@silocitypages/ui-core';

interface SpoolsAlertDisplayProps {
  showAlert: boolean;
  alertVariant: string;
  alertMessage: string;
  onClose: () => void;
}

const SpoolsAlertDisplay: React.FC<SpoolsAlertDisplayProps> = ({
  showAlert,
  alertVariant,
  alertMessage,
  onClose,
}) => {
  return (
    <Row>
      <Col xs={12} className='mb-3'>
        <CustomAlert
          variant={alertVariant}
          message={alertMessage}
          show={showAlert}
          onClose={onClose}
        />
      </Col>
    </Row>
  );
};

export default SpoolsAlertDisplay;
