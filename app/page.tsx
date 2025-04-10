import { Container, Row, Col } from "react-bootstrap";

export default function HomePage() {
  return (
    <Container className="main-content mt-3 mb-3">
      <h3 className="text-center my-3">SiloCityPages</h3>
      <Row className="shadow-lg p-3 bg-body rounded">
        <Col lg={8} className="mx-auto">
          SiloCityPages, developed by SiloCityLabs, is a streamlined framework
          designed to accelerate the development and deployment of static
          websites. Leveraging the power of Bootstrap for responsive design,
          React for component-driven architecture, and Next.js for efficient
          rendering, SiloCityPages provides a robust foundation for building
          modern web applications. Optimized for seamless deployment to GitHub
          Pages, this framework simplifies the process of creating and hosting
          performant, visually appealing websites, allowing developers to focus
          on content and functionality rather than complex configurations.
        </Col>
      </Row>
    </Container>
  );
}
