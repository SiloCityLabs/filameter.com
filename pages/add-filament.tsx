import Head from "next/head";
import { Container, Row, Col } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageFilament from "@/components/ManageFilament";

export default function AddFilament() {
  return (
    <>
      <Head>
        <title>Filameter - Add Filament</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header />
        <Container className="main-content">
          <Row className="shadow-lg p-3 bg-body rounded mt-4">
            <h3 className="text-center">Add Filament</h3>
            <Col>
              <ManageFilament />
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
