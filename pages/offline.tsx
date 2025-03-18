import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Container, Row, Col, Button } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const redirects: Record<string, string> = {
  "/inventory-list": "/spools",
};

export default function Offline() {
  const router = useRouter();

  useEffect(() => {
    const newPath = redirects[window.location.pathname];
    if (newPath) {
      router.replace(newPath);
    }
  }, []);

  return (
    <>
      <Head>
        <title>Page Not Found</title>
        <meta name="description" content="This page could not be found." />
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
