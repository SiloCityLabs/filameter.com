import Head from "next/head";
import { Container, Row } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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
          <Row className="shadow-lg p-3 bg-body rounded mt-4">Add Filament</Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
