import { useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Container, Row, Col } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const redirects: Record<string, string> = {
  //Example
  "/old": "/new",
};

export default function NotFoundPage() {
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
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <div className="main-container">
        <Header />
        <Container className="main-content" fluid>
          <Row>
            <Col>
              <h2 className="text-center">404 - Page Not Found</h2>

              <Container
                id="about-us"
                className="shadow-lg p-3 mb-5 bg-body rounded text-center"
              >
                <Row className="justify-content-md-center">
                  <Col lg={8}>
                    <p>
                      If you were looking for something, it might have moved.
                    </p>
                    <p>Redirecting if necessary...</p>
                  </Col>
                </Row>
              </Container>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
