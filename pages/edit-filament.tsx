import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageFilament from "@/components/ManageFilament";
//DB
import getFilamentById from "@/helpers/filament/getFilamentById";
import { initializeFilamentDB } from "@/helpers/filament/initializeFilamentDB";
//Tmp data
import data from "@/json/tmp-data.json";

export default function EditFilament() {
  const [db, setDb] = useState(null);
  const [filament, setFilament] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filamentIdToFetch, setFilamentIdToFetch] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get("id");
    setFilamentIdToFetch(currentId);

    async function init() {
      const initializedDb = await initializeFilamentDB();
      setDb(initializedDb);
    }
    init();
  }, []);

  const fetchFilament = async (id: string) => {
    setIsLoading(true);
    setError(null);

    if (db) {
      try {
        const fetchedFilament = await getFilamentById(db, id);
        setFilament(fetchedFilament);
      } catch (err: unknown) {
        if (typeof err === "string") {
          setError(err);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch filament.");
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    if (filamentIdToFetch) {
      fetchFilament(filamentIdToFetch);
    }
  }, [filamentIdToFetch, db]);

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
            {filamentIdToFetch ? (
              filament ? (
                <>
                  <h3 className="text-center">
                    Edit Filament - {filamentIdToFetch}
                  </h3>
                  <Col>
                    <ManageFilament data={filament} />
                  </Col>
                </>
              ) : (
                <p>Filament data not found for ID: {filamentIdToFetch}</p>
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
