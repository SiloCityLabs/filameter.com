import React, { Suspense } from "react";
import type { Metadata } from "next";
import { Container, Row, Col, Spinner } from "react-bootstrap";
// --- Layout ---
import PageLayout from "@/components/PageLayout";
// Components
import FeedbackForm from "@/components/FeedbackForm";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Provide feedback or report an issue via GitHub.",
};

export default function FeedbackPage() {
  return (
    <PageLayout>
      <Container className="py-3">
        <h3 className="text-center">Feedback</h3>
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
    </PageLayout>
  );
}
