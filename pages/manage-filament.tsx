import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ManageFilament from "@/components/ManageFilament";
//DB
import getFilamentById from "@/helpers/filament/getFilamentById";
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
  const { db, isLoadingDB } = useDatabase();
  const [filament, setFilament] = useState<Filament>(defaultValue);
  const [type, setType] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [filamentIdToFetch, setFilamentIdToFetch] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true); // Keep this local loading state

  useEffect(() => {
    // This useEffect is for handling URL parameters, and it's fine to run only once.
    const urlParams = new URLSearchParams(window.location.search);
    const currentId = urlParams.get("id");
    const type_url = urlParams.get("type") ?? "";
    const usedWeight = urlParams.get("used_weight") ?? 0;

    setFilamentIdToFetch(currentId);
    setType(type_url);

    let overwriteObj: Partial<Filament> = {}; // Use Partial<Filament>

    if (usedWeight) {
      overwriteObj.used_weight = parseInt(usedWeight);
    }
    if (currentId && type_url === "create") {
      overwriteObj._id = currentId;
    }
    setFilament({ ...defaultValue, ...overwriteObj });
    setIsLoading(false); //set loading to false
  }, []);

  const fetchFilament = async (id: string) => {
    setIsLoading(true); // Keep local loading state
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
        setIsLoading(false); // Keep local loading state
      }
    } else {
      setError("Database not available."); // Good to handle this case
    }
  };

  useEffect(() => {
    if (
      !isLoadingDB &&
      db &&
      filamentIdToFetch &&
      (type === "" || type === "duplicate")
    ) {
      fetchFilament(filamentIdToFetch);
    } else if (!isLoadingDB) {
      setIsLoading(false); //all other situations we set loading to false.
    }
  }, [filamentIdToFetch, db, type, isLoadingDB]); // Correct dependencies

  if (isLoadingDB || isLoading) {
    return <div className="text-center">Loading...</div>;
  }
  if (error) {
    return <div className="text-center">Error: {error}</div>;
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
        <Header showBadge={true} />
        <Container className="main-content">
          <Row className="shadow-lg p-3 bg-body rounded mt-4">
            {filamentIdToFetch && type === "" ? (
              filament ? (
                <>
                  <h3 className="text-center">Edit Filament</h3>
                  <Col>
                    <ManageFilament data={filament} db={db} />
                  </Col>
                </>
              ) : (
                <p>Filament data not found for ID: {filamentIdToFetch}</p>
              )
            ) : (
              <>
                <h3 className="text-center">Add Filament</h3>
                <Col>
                  <ManageFilament data={filament} db={db} />
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
