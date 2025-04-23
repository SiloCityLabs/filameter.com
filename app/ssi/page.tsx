"use client";

// --- React ---
import { useCallback, useEffect, useState, Suspense } from "react";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
// --- Next ---
import { useRouter, useSearchParams } from "next/navigation";
// --- Layout ---
import PageLayout from "@/components/PageLayout";
// --- Components ---
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
// --- DB ---
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import { save } from "@/helpers/_silabs/pouchDb/save";
import { filamentSchema } from "@/helpers/database/filament/migrateFilamentDB";
// --- Context ---
import { useDatabase } from "@/contexts/DatabaseContext";

// --- Main Content Component ---
function SpoolSenseImportContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { dbs, isReady, error: contextDbError } = useDatabase();

  // Local state for UI feedback and processing logic
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("info");
  const [alertMessage, setAlertMessage] = useState("");
  const [error, setError] = useState<boolean>(false); // Local processing errors
  const [filamentId, setFilamentId] = useState<string | null>(null);
  const [usedWeight, setUsedWeight] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setError(false);
    setShowAlert(false);

    const currentId = searchParams?.get("id") ?? null;
    const usedWeightParam = searchParams?.get("used") ?? null;

    setFilamentId(currentId);

    if (usedWeightParam !== null) {
      const parsedWeight = parseInt(usedWeightParam, 10);
      if (!isNaN(parsedWeight)) {
        setUsedWeight(parsedWeight);
      } else {
        setError(true);
        setShowAlert(true);
        setAlertMessage("Invalid 'used' parameter value in URL.");
        setAlertVariant("danger");
        return;
      }
    }

    if (!currentId || usedWeightParam === null) {
      setError(true);
      setShowAlert(true);
      setAlertMessage("Missing required 'id' or 'used' parameter in URL.");
      setAlertVariant("danger");
      return;
    }
  }, [searchParams]);

  const fetchFilament = useCallback(
    async (id: string, used: number) => {
      const filamentDb = dbs.filament;

      if (!filamentDb) {
        console.error("Filament DB instance is not available from context.");
        setError(true);
        setShowAlert(true);
        setAlertMessage("Database connection error.");
        setAlertVariant("danger");
        return;
      }

      setIsProcessing(true);
      setError(false);
      setShowAlert(false);

      try {
        const fetchedFilament = await getDocumentByColumn(
          filamentDb,
          "_id",
          id,
          "filament"
        );

        if (
          !fetchedFilament ||
          fetchedFilament.length === 0 ||
          !fetchedFilament[0]
        ) {
          console.log(
            `Filament with id ${id} not found. Redirecting to create.`
          );
          // Redirect to create page with prefilled data
          router.replace(
            `/manage-filament?used_weight=${used}&id=${id}&type=create`
          );
          return;
        }

        // Filament found, prepare update
        const filamentToUpdate = { ...fetchedFilament[0], used_weight: used };

        // --- Save updated data ---
        const result = await save(
          filamentDb,
          filamentToUpdate,
          filamentSchema,
          "filament"
        );

        if (result.success) {
          console.log(`Filament ${id} updated successfully. Redirecting.`);
          router.replace(
            `/spools?alert_msg=Filament ${id} updated successfully&alert_variant=success`
          );
          return;
        } else {
          console.error(`Error: Filament not updating:`, result.error);
          setError(true);
          setShowAlert(true);
          setAlertVariant("danger");
          setAlertMessage(
            (result.error as string) || "Error updating filament record."
          );
        }
      } catch (err: unknown) {
        console.error("Failed to fetch or update filament:", err);
        let msg = "Failed to process filament data.";
        if (err instanceof Error) {
          msg = err.message;
        } else if (typeof err === "string") {
          msg = err;
        }
        setError(true);
        setShowAlert(true);
        setAlertMessage(msg);
        setAlertVariant("danger");
      } finally {
        setIsProcessing(false);
      }
    },
    [dbs.filament, router]
  );

  useEffect(() => {
    if (
      filamentId &&
      typeof usedWeight === "number" &&
      isReady &&
      dbs.filament
    ) {
      if (!isProcessing) {
        fetchFilament(filamentId, usedWeight);
      }
    }
  }, [
    filamentId,
    usedWeight,
    isReady,
    dbs.filament,
    fetchFilament,
    isProcessing,
  ]);

  if (!isReady) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-md-center text-center">
          <Col xs={12}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            <p className="mt-2">Initializing Database Context...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  if (contextDbError) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Database Context Error</Alert.Heading>
          <p>Failed to initialize the required database context:</p>
          <pre className="mb-0">{contextDbError}</pre>
        </Alert>
      </Container>
    );
  }

  if (isProcessing) {
    return (
      <Container fluid className="py-5">
        <Row className="justify-content-md-center text-center">
          <Col xs={12}>
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Processing...</span>
            </Spinner>
            <p className="mt-2">Processing Spool Data...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <h2 className="text-center mb-4">Spool Sense Import Status</h2>
          <div className="shadow-lg p-3 mb-5 bg-body rounded text-center">
            <CustomAlert
              variant={alertVariant}
              message={alertMessage}
              show={showAlert}
              onClose={() => setShowAlert(false)}
            />
            {error && !showAlert && (
              <p className="text-danger mt-3">
                An error occurred. Please check parameters or try again.
              </p>
            )}
            {!error && !showAlert && (
              <p className="text-muted mt-3">
                Processing complete or redirecting...
              </p>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default function SpoolSenseImportPage() {
  return (
    <Suspense
      fallback={
        <Container fluid className="py-5 text-center">
          <Spinner animation="border" size="sm" /> Loading Parameters...
        </Container>
      }
    >
      <SpoolSenseImportContent />
    </Suspense>
  );
}
