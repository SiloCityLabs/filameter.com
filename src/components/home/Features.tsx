'use client';

// --- React ---
import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
// --- Styles ---
import styles from '@/public/styles/components/home/Features.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBoxOpen,
  faChartLine,
  faHouseUser,
  faExchangeAlt,
  faQrcode,
} from '@fortawesome/free-solid-svg-icons';

// Feature data array for easy management
const features = [
  {
    icon: <FontAwesomeIcon icon={faBoxOpen} size='2x' />,
    title: 'Filament Tracking',
    description:
      'FilaMeter makes it simple to log and monitor your filament usage. Keep tabs on color, material, weight, and storage location—no spreadsheets required.',
  },
  {
    icon: <FontAwesomeIcon icon={faChartLine} size='2x' />,
    title: 'Track Usage Accurately Across Multiple Devices',
    description:
      'Log filaments usage after every print to maintain an accurate, real-time material inventory. Access your spool data from phone, tablet, or desktop.',
  },
  {
    icon: <FontAwesomeIcon icon={faExchangeAlt} size='2x' />,
    title: 'Simple to Update',
    description:
      'With FilaMeter Labels, managing spools is as easy as scanning a QR code. Instantly open and edit spool data from multiple devices.',
  },
  {
    icon: <FontAwesomeIcon icon={faHouseUser} size='2x' />,
    title: 'Suitable for All Users',
    description:
      'Whether you’re managing a home print setup or a professional lab, FilaMeter is designed to fit seamlessly into your 3D printing workflow.',
  },
  {
    icon: <FontAwesomeIcon icon={faQrcode} size='2x' />,
    title: 'Hardware That Works With You',
    description:
      'From QR code labels to upcoming in-spool sensors, FilaMeter offers hardware tools that simplify spool tracking and reduce manual input,helping you focus on printing, not paperwork.',
  },
];

const Features: React.FC = () => {
  return (
    <section className={styles.featuresSection} id='features'>
      <Container>
        {/* Section Header */}
        <Row className='justify-content-center text-center'>
          <Col md={8}>
            <h2 className='display-5 fw-bold'>FilaMeter Benefits</h2>
            <p className='lead text-muted'>
              FilaMeter provides all the tools you need to track, manage, and optimize your 3D
              printing filament.
            </p>
          </Col>
        </Row>

        {/* Feature Cards */}
        <Row className='justify-content-center mt-3'>
          {features.map((feature, index) => (
            <Col key={index} md={6} lg={4} className='mb-4 d-flex'>
              <Card className={styles.featureCard}>
                <Card.Body>
                  <div className={styles.iconWrapper}>{feature.icon}</div>
                  <Card.Title as='h4' className='fw-bold mt-3'>
                    {feature.title}
                  </Card.Title>
                  <Card.Text className={styles.cardText}>{feature.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </section>
  );
};

export default Features;
