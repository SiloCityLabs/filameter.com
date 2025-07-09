'use client';

import React from 'react';
import { Accordion, Card, Col, Row } from 'react-bootstrap';
import { faqData } from './data';
import styles from '@/public/styles/components/faq/Faq.module.css';

const Faq = () => {
  return (
    <Card className={styles.faqCard}>
      <Card.Body>
        <h1 className={`${styles.pageTitle} text-center`}>FilaMeter FAQ</h1>
        <Row className='justify-content-center'>
          <Col lg={10}>
            <Accordion defaultActiveKey='0' className={styles.faqAccordion}>
              {faqData.map((item) => (
                <Accordion.Item key={item.eventKey} eventKey={item.eventKey}>
                  <Accordion.Header>{item.question}</Accordion.Header>
                  <Accordion.Body>{item.answer}</Accordion.Body>
                </Accordion.Item>
              ))}
            </Accordion>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default Faq;
