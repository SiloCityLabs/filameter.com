import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Container, Row, Col, Spinner } from "react-bootstrap";
// Components
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Provide feedback or report an issue via GitHub.",
};

export default function FeedbackPage() {
  return (
    <Container className="main-content py-3 py-md-4">
      <h3 className="text-center mt-4">Feedback</h3>
      <Row className="justify-content-center mt-3">
        <Col md={10} lg={8}>
          <Suspense
            fallback={
              <div className="text-center py-5">
                <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading Form...</span>
                </Spinner>
                <p className="mt-2">Loading Form...</p>
              </div>
            }
          >
            <FeedbackForm />
          </Suspense>
        </Col>
      </Row>
    </Container>
  );
}
