"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Container, Row, Col, Spinner } from "react-bootstrap";
// --- Components ---
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
// --- DB ---
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import { initializeFilamentDB } from "@/helpers/database/filament/initializeFilamentDB";
import { save } from "@/helpers/_silabs/pouchDb/save";
import { filamentSchema } from "@/helpers/database/filament/initializeFilamentDB";

// --- PouchDB Type ---
type PouchDBInstance = PouchDB.Database | null;

function SpoolSenseImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [db, setDb] = useState<PouchDBInstance>(null);
  const [error, setError] = useState<boolean>(false);
  const [filamentId, setFilamentId] = useState<string | null>(null);
  const [usedWeight, setUsedWeight] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const currentId = searchParams?.get("id") ?? "";
    const usedWeightParam = searchParams?.get("used") ?? "";

    setFilamentId(currentId);
    if (usedWeightParam) {
      const parsedWeight = parseInt(usedWeightParam, 10);
      if (!isNaN(parsedWeight)) {
        setUsedWeight(parsedWeight);
      } else {
        setError(true);
        setShowAlert(true);
        setAlertMessage("Invalid 'used' parameter in URL.");
        setAlertVariant("danger");
        setIsLoading(false);
        return;
      }
    }

    // Check for missing essential data *after* attempting to parse
    if (!currentId || usedWeightParam === null) {
      setError(true);
      setShowAlert(true);
      setAlertMessage("Missing 'id' or 'used' parameter in URL.");
      setAlertVariant("danger");
      setIsLoading(false);
      return;
    }

    // Initialize DB
    async function init() {
      try {
        const initializedDb = await initializeFilamentDB();
        setDb(initializedDb);
        // Don't set loading to false here, wait for fetchFilament trigger
      } catch (dbError) {
        console.error("Failed to initialize database:", dbError);
        setError(true);
        setShowAlert(true);
        setAlertMessage("Database initialization failed.");
        setAlertVariant("danger");
        setIsLoading(false);
      }
    }
    init();
  }, [searchParams]);

  const fetchFilament = useCallback(
    async (id: string, used: number) => {
      setIsLoading(true);
      setError(false);

      if (!db) {
        console.error("Database not initialized yet.");
        setShowAlert(true);
        setAlertMessage("Database connection not ready.");
        setAlertVariant("warning");
        setIsLoading(false);
        return;
      }

      try {
        const fetchedFilament = await getDocumentByColumn(
          db,
          "_id",
          id,
          "filament"
        );

        // No id found = Redirect to create page with prefilled data
        if (
          !fetchedFilament ||
          fetchedFilament.length === 0 ||
          fetchedFilament[0] === null
        ) {
          console.log(
            `Filament with id ${id} not found. Redirecting to create.`
          );
          router.push(
            `/manage-filament?used_weight=${used}&id=${id}&type=create`
          );

          return;
        }

        // Filament found, update used_weight
        const filamentToUpdate = { ...fetchedFilament[0], used_weight: used };

        // Update Data in DB
        const result = await save(
          db,
          filamentToUpdate,
          filamentSchema,
          "filament"
        );

        if (result.success) {
          // Don't show alert here, redirect with query param instead
          console.log(`Filament ${id} updated successfully. Redirecting.`);
          // Redirect to spools page with a success message
          router.replace(
            `/spools?alert_msg=Filament ${id} updated successfully&alert_variant=success`
          );
          // No need to set loading false here
        } else {
          console.error(`Error: Filament not updating:`, result.error);
          setError(true); // Keep error state on this page
          setShowAlert(true);
          setAlertVariant("danger");
          setAlertMessage("Error updating filament record.");
          setIsLoading(false);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch or update filament:", err);
        let msg = "Failed to process filament data.";
        if (typeof err === "string") {
          msg = err;
        } else if (err instanceof Error) {
          msg = err.message;
        }

        setError(true);
        setShowAlert(true);
        setAlertMessage(msg);
        setAlertVariant("danger");
        setIsLoading(false);
      }
    },
    [db, router] // Dependencies for the callback
  );

  useEffect(() => {
    if (filamentId && typeof usedWeight === "number" && db) {
      fetchFilament(filamentId, usedWeight);
    }
    // Only run when these specific dependencies change
  }, [filamentId, usedWeight, db, fetchFilament]);

  if (isLoading) {
    return (
      <Container className="main-content" fluid>
        <Row className="justify-content-md-center text-center mt-5">
          <Col xs={12}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Loading Spool Data...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid>
      <Row>
        <Col>
          <h2 className="text-center my-4">Spool Sense Import</h2>

          <Container
            id="ssi-status"
            className="shadow-lg p-3 mb-5 bg-body rounded text-center"
          >
            <Row className="justify-content-md-center">
              <Col lg={8}>
                <CustomAlert
                  variant={alertVariant}
                  message={alertMessage}
                  show={showAlert}
                  onClose={() => setShowAlert(false)}
                />
                {error && !showAlert && (
                  <p className="text-danger">
                    An error occurred during processing.
                  </p>
                )}
                {!error && !showAlert && (
                  <p>Processing complete or redirecting...</p>
                )}
              </Col>
            </Row>
          </Container>
        </Col>
      </Row>
    </Container>
  );
}

export default function SpoolSenseImportPage() {
  return (
    <Suspense fallback={<div>Loading Parameters...</div>}>
      <SpoolSenseImportContent />
    </Suspense>
  );
}
