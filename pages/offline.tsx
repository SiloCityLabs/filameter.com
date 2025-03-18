import Head from "next/head";
import { Container, Row, Col, Button } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Offline() {
  return (
    <>
      <Head>
        <title>FilaMeter Offline</title>
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
        <Container className="main-content" fluid>
          <Row>
            <Col>
              <h2 className="text-center">You are offline</h2>

              <div className="text-center">
                <p>
                  It seems you are not connected to the internet. Please check
                  your connection and try again.
                </p>
                <Button
                  onClick={() => window.location.reload()}
                  variant="primary"
                  size="sm"
                >
                  Retry
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
