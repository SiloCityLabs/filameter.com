import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageFilament from "@/components/ManageFilament";
//Tmp data
import data from "@/json/tmp-data.json";

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
            {id ? (
              data && data[id] ? (
                <>
                  <h3 className="text-center">Edit Filament - {id}</h3>
                  <Col>
                    <ManageFilament data={data[id]} />
                  </Col>
                </>
              ) : (
                <p>Filament data not found for ID: {id}</p>
              )
            ) : (
              <p>Missing ID</p>
            )}
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
