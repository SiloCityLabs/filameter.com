import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageFilament from "@/components/ManageFilament";
//DB
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import { useDatabase } from "@/contexts/DatabaseContext";
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

export default function ManageFilamentPage() {
  const { dbs, isReady } = useDatabase(); // Use 'isReady'
  const [filament, setFilament] = useState<Filament>(defaultValue);
  const [type, setType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [filamentIdToFetch, setFilamentIdToFetch] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true); // Local loading state

  useEffect(() => {
    // Handle URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get("id");
    const type_url = urlParams.get("type") ?? "";
    const usedWeight = urlParams.get("used_weight");

    setFilamentIdToFetch(currentId);
    setType(type_url);

    let overwriteObj: Partial<Filament> = {};

    if (usedWeight) {
      overwriteObj.used_weight = parseInt(usedWeight, 10);
    }
    if (currentId && type_url === "create") {
      overwriteObj._id = currentId;
    }
    setFilament({ ...defaultValue, ...overwriteObj });
    setIsLoading(false); // Set loading to false after initial setup
  }, []);

  const fetchFilament = async (id: string) => {
    setIsLoading(true);
    setError(null);

    if (dbs.filament) {
      try {
        const fetchedFilament = await getDocumentByColumn(
          dbs.filament,
          "_id",
          id,
          "filament"
        );
        console.log(fetchedFilament[0]);
        setFilament(fetchedFilament[0]);

        if (type === "duplicate") {
          const { _id, _rev, ...filamentWithoutIdAndRev } = fetchedFilament[0];
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
    } else {
      setError("Database not available.");
    }
  };

  useEffect(() => {
    if (
      isReady && // Use 'isReady' here
      dbs.filament &&
      filamentIdToFetch &&
      (type === "" || type === "duplicate")
    ) {
      fetchFilament(filamentIdToFetch);
    } else if (isReady) {
      // Use 'isReady' here
      setIsLoading(false);
    }
  }, [filamentIdToFetch, dbs, type, isReady]);

  if (isReady === false || isLoading) {
    // More accurate check
    return <div className="text-center">Loading...</div>;
  }
  if (error) {
    return <div className="text-center">Error: {error}</div>;
  }

  return (
    <>
      <Head>
        <title>FilaMeter - Manage Filament</title>
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
        <Container className="main-content">
          <Row className="shadow-lg p-3 bg-body rounded mt-4">
            {filamentIdToFetch && type === "" ? (
              filament ? (
                <>
                  <h3 className="text-center">Edit Filament</h3>
                  <Col>
                    <ManageFilament data={filament} db={dbs.filament} />
                  </Col>
                </>
              ) : (
                <p>Filament data not found for ID: {filamentIdToFetch}</p>
              )
            ) : (
              <>
                <h3 className="text-center">Add Filament</h3>
                <Col>
                  <ManageFilament data={filament} db={dbs.filament} />
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
