"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap";
import ManageFilament from "@/components/ManageFilament";
// --- DB ---
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import { useDatabase } from "@/contexts/DatabaseContext";
// --- Types ---
import { Filament } from "@/types/Filament";

// --- Default Value ---
const defaultValue: Omit<Filament, "_id" | "_rev"> = {
  filament: "",
  material: "",
  used_weight: 0,
  total_weight: 1000,
  location: "",
  comments: "",
};

export default function ManageFilamentPage() {
  const { dbs, isReady } = useDatabase();
  const searchParams = useSearchParams();

  // State
  const [filament, setFilament] = useState<Filament>(defaultValue);
  const [operationType, setOperationType] = useState<
    "create" | "edit" | "duplicate"
  >("create");
  const [error, setError] = useState<string | null>(null);
  const [filamentIdToFetch, setFilamentIdToFetch] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  // Read URL params and set initial state
  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const currentId = searchParams?.get("id") ?? "";
    const typeParam = searchParams?.get("type") ?? "";
    const usedWeightParam = searchParams?.get("used_weight") ?? 0;

    let initialFilamentData: Filament = { ...defaultValue };
    let determinedType: "create" | "edit" | "duplicate" = "create";

    if (currentId) {
      setFilamentIdToFetch(currentId);
      if (typeParam === "duplicate") {
        determinedType = "duplicate";
      } else if (typeParam === "create") {
        determinedType = "create";
        initialFilamentData._id = currentId;
      } else {
        determinedType = "edit";
      }
    } else {
      determinedType = "create";
    }

    // Apply used_weight if provided
    if (usedWeightParam) {
      const parsedWeight = parseInt(usedWeightParam, 10);
      if (!isNaN(parsedWeight)) {
        initialFilamentData.used_weight = parsedWeight;
      }
    }

    setFilament(initialFilamentData);
    setOperationType(determinedType);

    // If not fetching, initial setup is done
    if (determinedType === "create") {
      setIsLoading(false);
    }
  }, [searchParams]);

  // Fetch data if needed (Edit or Duplicate)
  const fetchFilament = useCallback(
    async (id: string) => {
      if (!dbs.filament) {
        setError("Database connection not available for fetching.");
        setIsLoading(false);
        setIsFetching(false);
        return;
      }

      setIsFetching(true);
      setError(null);

      try {
        const results = await getDocumentByColumn(
          dbs.filament,
          "_id",
          id,
          "filament"
        );

        if (!results || results.length === 0) {
          throw new Error(`Filament with ID "${id}" not found.`);
        }

        let fetchedData: Filament = results;

        if (operationType === "duplicate") {
          // For duplicate, remove _id and _rev, keep the rest
          const { _id, _rev, ...duplicableData } = fetchedData;
          setFilament({
            ...defaultValue,
            ...duplicableData,
            used_weight: defaultValue.used_weight,
          });
        } else {
          setFilament(fetchedData);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "An unknown error occurred during fetch.";
        console.error("Fetch filament error:", err);
        setError(`Failed to load filament data: ${message}`);
      } finally {
        setIsLoading(false);
        setIsFetching(false);
      }
    },
    [dbs.filament, operationType]
  );

  useEffect(() => {
    if (
      isReady &&
      filamentIdToFetch &&
      (operationType === "edit" || operationType === "duplicate")
    ) {
      fetchFilament(filamentIdToFetch);
    } else if (isReady && operationType === "create") {
      setIsLoading(false);
    }
  }, [isReady, filamentIdToFetch, operationType, fetchFilament]);

  if (isLoading || (!isReady && operationType !== "create")) {
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading Filament Data...</p>
      </Container>
    );
  }

  if (error && operationType !== "create") {
    return (
      <Container className="my-4">
        <Alert variant="danger">
          <Alert.Heading>Error Loading Filament</Alert.Heading>
          <p>{error}</p>
          <hr />
          <p className="mb-0">
            Please check the filament ID or try again later. You can also{" "}
            <Alert.Link href="/spools">return to the spools list</Alert.Link> or{" "}
            <Alert.Link href="/manage-filament">
              try adding a new filament
            </Alert.Link>
            .
          </p>
        </Alert>
      </Container>
    );
  }

  const pageTitle = operationType === "edit" ? "Edit Filament" : "Add Filament";

  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div className="shadow-lg p-3 p-md-4 bg-body rounded">
            <h2 className="text-center mb-4">{pageTitle}</h2>
            {isReady && dbs.filament ? (
              <ManageFilament data={filament} db={dbs.filament} />
            ) : (
              <Alert variant="info" className="text-center">
                Database connection is initializing... Form will load shortly.
              </Alert>
            )}
          </div>
        </Col>
      </Row>
    </Container>
  );
}
