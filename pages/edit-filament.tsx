import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function EditFilament() {
  const [isLoading, setIsLoading] = useState(true);
  const [id, setId] = useState<string | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get("ID");
    setId(currentId);

    setIsLoading(false);
  });

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Filameter - Edit Filament</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header />
        <Container className="main-content">
          <Row className="shadow-lg p-3 bg-body rounded mt-4">
            Edit Filament - {id}
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
