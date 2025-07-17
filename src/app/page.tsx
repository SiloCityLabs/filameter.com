// --- React ---
import { Container, Row, Col, Button } from 'react-bootstrap';
// --- Layout ---
import PageLayout from '@/components/PageLayout';

export default function HomePage() {
  return (
    <PageLayout>
      <Container className='mt-3 mb-5'>
        <div
          className='text-center p-5 mb-4 bg-body-tertiary rounded-3'
          style={{ boxShadow: '0 0.125rem 0.25rem rgba(0, 0, 0, 0.075)' }}>
          <h1 className='display-4'>Welcome to SiloCityPages</h1>
          <p className='lead'>
            A modern, efficient, and open-source framework for building and deploying static
            websites with ease.
          </p>
        </div>

        <Row className='mb-5'>
          <Col md={10} lg={8} className='mx-auto'>
            <h2 className='text-center mb-4'>What is SiloCityPages?</h2>
            <p>
              SiloCityPages is a streamlined framework designed to accelerate the development and
              deployment of static websites. Leveraging the power of Bootstrap for responsive
              design, React for component-driven architecture, and Next.js for efficient rendering,
              SiloCityPages provides a robust foundation for building modern web applications.
              Optimized for seamless deployment to GitHub Pages, this framework simplifies the
              process of creating and hosting performant, visually appealing websites, allowing
              developers to focus on content and functionality rather than complex configurations.
            </p>
          </Col>
        </Row>

        <hr className='my-5' />

        <Row className='text-center'>
          <Col md={6} className='mb-4 mb-md-0'>
            <h3>Get Started</h3>
            <p>Fork the repository on GitHub and start building your own website in minutes.</p>
            <Button
              variant='primary'
              href='https://github.com/SiloCityLabs/SiloCityPages'
              target='_blank'>
              View on GitHub
            </Button>
          </Col>
          <Col md={6}>
            <h3>Documentation</h3>
            <p>Read the README file for detailed instructions on how to use the framework.</p>
            <Button
              variant='secondary'
              href='https://github.com/SiloCityLabs/SiloCityPages#readme'
              target='_blank'>
              Read Docs
            </Button>
          </Col>
        </Row>

        <hr className='my-5' />

        <Row className='mt-5 text-center'>
          <Col>
            <p>
              This project is a collaborative effort by{' '}
              <a href='https://onebuffalolabs.com' target='_blank' rel='noopener noreferrer'>
                OneBuffaloLabs
              </a>{' '}
              and{' '}
              <a href='https://silocitylabs.com' target='_blank' rel='noopener noreferrer'>
                SiloCityLabs
              </a>
              .
            </p>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
}
