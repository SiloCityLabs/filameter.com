import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Button } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageFilament from "@/components/ManageFilament";
//DB
import getFilamentById from "@/helpers/filament/getFilamentById";
import { initializeFilamentDB } from "@/helpers/filament/initializeFilamentDB";
//Types
import { Filament } from "@/types/Filament";

const defaultValue: Filament = {
  filament: "",
  material: "",
  used_weight: 0,
  total_weight: 1000,
  location: "",
  comments: "",
};

export default function EditFilament() {
  const [db, setDb] = useState(null);
  const [filament, setFilament] = useState<Filament>(defaultValue);
  const [type, setType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [filamentIdToFetch, setFilamentIdToFetch] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get("id");
    const type = urlParams.get("type") ?? "";
    const usedWeight = urlParams.get("used_weight") ?? 0;
    setFilamentIdToFetch(currentId);
    setType(type);
    let overwriteObj = {};

    if (usedWeight) {
      overwriteObj["used_weight"] = parseInt(usedWeight);
    }
    if (currentId && type === "create") {
      overwriteObj["_id"] = currentId;
    }
    setFilament({ ...defaultValue, ...overwriteObj });

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

        if (type === "duplicate") {
          const { _id, _rev, ...filamentWithoutIdAndRev } = fetchedFilament;
          setFilament(filamentWithoutIdAndRev);
        }
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
    if (filamentIdToFetch && type === "") {
      fetchFilament(filamentIdToFetch);
    } else {
      setIsLoading(false);
    }
  }, [filamentIdToFetch, db]);

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>FilaMeter - Manage Filament</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header />
        <Container className="main-content">
          <Row className="shadow-lg p-3 bg-body rounded mt-4">
            {filamentIdToFetch && type === "" ? (
              filament ? (
                <>
                  <h3 className="text-center">Edit Filament</h3>
                  <Col>
                    <ManageFilament data={filament} />
                  </Col>
                </>
              ) : (
                <p>Filament data not found for ID: {filamentIdToFetch}</p>
              )
            ) : (
              <>
                <h3 className="text-center">Add Filament</h3>
                <Col>
                  <ManageFilament data={filament} />
                </Col>
              </>
            )}
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
