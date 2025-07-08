'use client';

import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
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
    title: 'Spool Tracking',
    description:
      'Easily track your filament spools by type, weight, material, and storage location for perfect organization.',
  },
  {
    icon: <FontAwesomeIcon icon={faChartLine} size='2x' />,
    title: 'Consumption Tracking',
    description:
      'Log filament usage after every print to maintain an accurate, real-time inventory of your remaining material.',
  },
  {
    icon: <FontAwesomeIcon icon={faHouseUser} size='2x' />,
    title: 'Local-First Approach',
    description:
      'Your data is yours. FilaMeter runs 100% locally in your browser, no accounts or cloud sync required.',
  },
  {
    icon: <FontAwesomeIcon icon={faExchangeAlt} size='2x' />,
    title: 'Import / Export',
    description:
      'Easily back up your entire filament database or migrate your inventory between different devices with a single click.',
  },
  {
    icon: <FontAwesomeIcon icon={faQrcode} size='2x' />,
    title: 'QR Code Integration',
    description:
      'Use QR codes for quick spool identification. Get 5 free labels to start managing your inventory effortlessly.',
  },
];

const Features: React.FC = () => {
  return (
    <section className={styles.featuresSection} id='features'>
      <Container>
        {/* Section Header */}
        <Row className='justify-content-center text-center'>
          <Col md={8}>
            <h2 className='display-5 fw-bold'>What We Do</h2>
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
