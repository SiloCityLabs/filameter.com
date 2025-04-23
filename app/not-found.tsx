// --- React ---
import { Container, Row, Col, Button } from "react-bootstrap";
// --- Next ---
import type { Metadata } from "next";
import Link from "next/link";
// --- Layout ---
import PageLayout from "@/components/PageLayout";
// --- Components ---
import NotFoundRedirector from "@/components/NotFoundRedirector";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you requested could not be found.",
};

export default function NotFound() {
  return (
    <PageLayout>
      <Container className="text-center py-5">
        <NotFoundRedirector />

        <Row className="justify-content-center">
          <Col md={8} lg={6}>
            <div className="shadow-lg p-4 p-md-5 mb-5 bg-body rounded">
              <h1 className="display-1 fw-bold">404</h1>
              <h2 className="mb-4">Page Not Found</h2>
              <p className="lead mb-4">
                Sorry, the page you are looking for does not exist or might have
                been moved. If it has moved recently, you might be redirected
                shortly.
              </p>
              <Link href="/" passHref>
                <Button variant="primary">Go back to Homepage</Button>
              </Link>
            </div>
          </Col>
        </Row>
      </Container>
    </PageLayout>
  );
}
