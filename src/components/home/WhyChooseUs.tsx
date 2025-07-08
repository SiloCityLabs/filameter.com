'use client';

// --- React ---
import React from 'react';
import { Container, Row, Col, Image } from 'react-bootstrap';
// --- Styles ---
import styles from '@/public/styles/components/home/WhyChooseUs.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGift, faUsers, faShieldAlt, faCodeBranch } from '@fortawesome/free-solid-svg-icons';

// Data array for the selling points
const sellingPoints = [
  {
    icon: <FontAwesomeIcon icon={faGift} />,
    title: 'No Strings Attached',
    description:
      'No ads, subscriptions, or logins required. FilaMeter is pure utility, free forever.',
  },
  {
    icon: <FontAwesomeIcon icon={faUsers} />,
    title: 'Versatile Use Cases',
    description: 'Perfect for home labs, bustling makerspaces, or even small-scale print farms.',
  },
  {
    icon: <FontAwesomeIcon icon={faShieldAlt} />,
    title: 'Reliability',
    description: "Built to last and run on GitHub Pages. We're not going anywhere anytime soon.",
  },
  {
    icon: <FontAwesomeIcon icon={faCodeBranch} />,
    title: 'Customizable & Open Source',
    description:
      'As an open-source project, FilaMeter is easily extendable and simple to self-host.',
  },
];

const WhyChooseUs: React.FC = () => {
  return (
    <section className={styles.whyChooseUsSection} id='why-us'>
      <Container>
        <Row className='align-items-center'>
          {/* Left Column: Image */}
          <Col lg={6} className='mb-5 mb-lg-0'>
            <div className={styles.imageContainer}>
              <Image
                src='/images/misc/3d-printing.webp'
                alt='FilaMeter App Screenshot'
                rounded
                fluid
                className={styles.featureImage}
              />
            </div>
          </Col>

          {/* Right Column: Content */}
          <Col lg={6}>
            <div className={styles.contentWrapper}>
              <h2 className='display-5 fw-bold mb-4'>Why FilaMeter?</h2>
              <ul className={styles.featureList}>
                {sellingPoints.map((point, index) => (
                  <li key={index} className={styles.featureItem}>
                    <div className={styles.featureIcon}>{point.icon}</div>
                    <div className={styles.featureText}>
                      <h5 className='fw-bold'>{point.title}</h5>
                      <p className='text-muted mb-0'>{point.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default WhyChooseUs;
