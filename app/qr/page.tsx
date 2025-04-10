"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Row, Col, Spinner } from "react-bootstrap";
// Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
// DB
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import { initializeFilamentDB } from "@/helpers/database/filament/initializeFilamentDB";

// --- Page Component ---
export default function QrScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [db, setDb] = useState<PouchDB.Database | null>(null);
  const [filamentId, setFilamentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<boolean>(false);

  // Effect to get the ID from URL and initialize DB
  useEffect(() => {
    const currentId = searchParams?.get("id") ?? "";

    if (!currentId) {
      setError(true);
      setShowAlert(true);
      setAlertMessage("Missing filament ID in URL.");
      setAlertVariant("danger");
      setIsLoading(false);
      return;
    }

    setFilamentId(currentId);

    // Initialize DB (async IIFE)
    (async () => {
      try {
        const initializedDb = await initializeFilamentDB();
        setDb(initializedDb);
      } catch (dbError) {
        console.error("Failed to initialize database:", dbError);
        setError(true);
        setShowAlert(true);
        setAlertMessage("Database initialization failed.");
        setAlertVariant("danger");
        setIsLoading(false);
      }
    })();
  }, [searchParams]);

  // Effect to fetch filament once ID and DB are ready
  useEffect(() => {
    const fetchFilament = async (id: string) => {
      if (!db) return;

      setIsLoading(true);
      setError(false);

      try {
        const fetchedFilament = await getDocumentByColumn(
          db,
          "_id",
          id,
          "filament"
        );

        const filamentDoc = Array.isArray(fetchedFilament)
          ? fetchedFilament[0]
          : null;

        // Redirect based on whether filament exists
        if (!filamentDoc) {
          router.push(`/manage-filament?id=${id}&type=create`);
        } else {
          router.push(`/manage-filament?id=${id}`);
        }
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch filament.";
        console.error("Fetch filament error:", err);
        setShowAlert(true);
        setAlertMessage(errorMessage);
        setAlertVariant("danger");
        setError(true);
        setIsLoading(false);
      }
    };

    if (filamentId && db) {
      fetchFilament(filamentId);
    }
  }, [filamentId, db, router]);

  if (isLoading && !error) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Processing QR Code...</p>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          <h2 className="text-center my-4">Spool Sense QR Scan</h2>
          <Container
            className="shadow-lg p-3 mb-5 bg-body rounded text-center"
            style={{ maxWidth: "600px", margin: "auto" }}
          >
            <Row className="justify-content-md-center">
              <CustomAlert
                variant={alertVariant}
                message={alertMessage}
                show={showAlert}
                onClose={() => setShowAlert(false)}
              />

              {isLoading && !error && (
                <Col lg={8}>
                  <div className="text-center">
                    <Spinner animation="border" size="sm" className="me-2" />
                    Processing...
                  </div>
                </Col>
              )}

              {error && !isLoading && (
                <Col lg={8}>
                  <p className="text-danger">
                    Could not process the QR code. Please try again or check the
                    URL.
                  </p>
                </Col>
              )}

              {!isLoading && !error && (
                <Col lg={8}>
                  <div className="text-center">
                    Redirecting...
                    <br />
                    {[...Array(5)].map((_, i) => (
                      <Spinner
                        key={i}
                        animation="grow"
                        size="sm"
                        className="mx-1"
                      />
                    ))}
                  </div>
                </Col>
              )}
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}
