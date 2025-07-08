'use client';

// --- React ---
import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card } from 'react-bootstrap';
// --- Styles ---
import styles from '@/public/styles/components/home/ContactSection.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const ContactSection: React.FC = () => {
  const [issueTitle, setIssueTitle] = useState('');
  const [issueBody, setIssueBody] = useState('');

  const githubRepoUrl = process.env.NEXT_PUBLIC_APP_GITHUB_URL || '#';
  const contactEmail = 'contact@filameter.com'; // Replace with your actual contact email

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Construct the URL to pre-populate a new GitHub issue
    const title = encodeURIComponent(issueTitle);
    const body = encodeURIComponent(issueBody);
    const githubIssueUrl = `${githubRepoUrl}/issues/new?title=${title}&body=${body}`;

    // Open the URL in a new tab
    window.open(githubIssueUrl, '_blank');
  };

  return (
    <section className={styles.contactSection} id='contact'>
      <Container>
        {/* Section Header */}
        <Row className='justify-content-center text-center mb-5'>
          <Col md={8}>
            <h2 className='display-5 fw-bold'>Get In Touch</h2>
            <p className='lead text-muted'>
              Have a question, a feature request, or a bug to report? We'd love to hear from you.
            </p>
          </Col>
        </Row>

        <Row>
          {/* Left Column: Contact Info */}
          <Col lg={5} className='mb-5 mb-lg-0'>
            <Card className={styles.infoCard}>
              <Card.Body>
                <h4 className='fw-bold'>Contact Information</h4>
                <p className='text-muted'>
                  For general inquiries or questions, please don't hesitate to reach out.
                </p>
                <div className={styles.contactItem}>
                  <FontAwesomeIcon icon={faEnvelope} className={styles.contactIcon} />
                  <a href={`mailto:${contactEmail}`} className={styles.contactLink}>
                    {contactEmail}
                  </a>
                </div>
                <div className={styles.contactItem}>
                  <FontAwesomeIcon icon={faGithub} className={styles.contactIcon} />
                  <a
                    href={githubRepoUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.contactLink}>
                    View on GitHub
                  </a>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Column: Feedback Form */}
          <Col lg={7}>
            <Card className={styles.formCard}>
              <Card.Body>
                <h4 className='fw-bold'>Submit Feedback</h4>
                <p className='text-muted small'>
                  Found a bug or have an idea? Fill out the form below to open a new issue on our
                  GitHub repository.
                </p>
                <Form onSubmit={handleFeedbackSubmit}>
                  <Form.Group className='mb-3' controlId='issueTitle'>
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type='text'
                      placeholder='e.g., Feature Request: Add new material type'
                      value={issueTitle}
                      onChange={(e) => setIssueTitle(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Form.Group className='mb-3' controlId='issueBody'>
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as='textarea'
                      rows={5}
                      placeholder='Please provide a detailed description of the issue or feature.'
                      value={issueBody}
                      onChange={(e) => setIssueBody(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button type='submit' className={styles.submitButton}>
                    <FontAwesomeIcon icon={faPaperPlane} className='me-2' />
                    Create GitHub Issue
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </section>
  );
};

export default ContactSection;
