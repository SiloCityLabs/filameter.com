"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation"; // <-- Import hook for search params
import type { Metadata } from "next"; // <-- Import Metadata type
import { Container, Row, Col, Spinner, Alert } from "react-bootstrap"; // <-- Import Spinner, Alert
import ManageFilament from "@/components/ManageFilament"; // <-- Your form component
// DB
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import { useDatabase } from "@/contexts/DatabaseContext";
// Types
import { Filament } from "@/types/Filament";
// Database Type (replace with your actual type if available)
import type PouchDB from "pouchdb-core";

// --- Default Value ---
const defaultValue: Omit<Filament, "_id" | "_rev"> = {
  filament: "",
  material: "",
  used_weight: 0,
  total_weight: 1000,
  location: "",
  comments: "",
};

// --- Metadata ---
// Static metadata as the specific title (Add/Edit) is determined client-side
export const metadata: Metadata = {
  title: "Manage Filament",
  description: "Add, edit, or duplicate filament spool records.",
};

// --- Page Component ---
export default function ManageFilamentPage() {
  const { dbs, isReady } = useDatabase();
  const searchParams = useSearchParams(); // <-- Hook to get search params

  // State
  const [filament, setFilament] = useState<Filament>(defaultValue);
  const [operationType, setOperationType] = useState<
    "create" | "edit" | "duplicate"
  >("create");
  const [error, setError] = useState<string | null>(null);
  const [filamentIdToFetch, setFilamentIdToFetch] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true); // Loading state for initial setup and fetching
  const [isFetching, setIsFetching] = useState(false); // Specific state for async fetch operation

  // --- Effects ---

  // 1. Effect to read URL params and set initial state
  useEffect(() => {
    setIsLoading(true); // Start loading
    setError(null); // Clear previous errors

    const currentId = searchParams?.get("id") ?? "";
    const typeParam = searchParams?.get("type") ?? "";
    const usedWeightParam = searchParams?.get("used_weight") ?? 0;

    let initialFilamentData: Filament = { ...defaultValue };
    let determinedType: "create" | "edit" | "duplicate" = "create";

    if (currentId) {
      setFilamentIdToFetch(currentId); // Store ID for potential fetch
      if (typeParam === "duplicate") {
        determinedType = "duplicate";
        // Fetch needed, initial data remains default for now
      } else if (typeParam === "create") {
        // Creating with a specific ID (e.g., from QR scan)
        determinedType = "create";
        initialFilamentData._id = currentId; // Pre-fill ID
      } else {
        // ID exists, no specific type or invalid type -> assume edit
        determinedType = "edit";
        // Fetch needed, initial data remains default for now
      }
    } else {
      // No ID -> definitely create
      determinedType = "create";
    }

    // Apply used_weight if provided (primarily for create/duplicate)
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
  }, [searchParams]); // Re-run if URL params change

  // 2. Effect to fetch data if needed (Edit or Duplicate)
  const fetchFilament = useCallback(
    async (id: string) => {
      if (!dbs.filament) {
        setError("Database connection not available for fetching.");
        setIsLoading(false); // Stop loading indicator
        setIsFetching(false);
        return;
      }

      setIsFetching(true); // Indicate fetch operation is starting
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

        let fetchedData: Filament = results[0];

        if (operationType === "duplicate") {
          // For duplicate, remove _id and _rev, keep the rest
          const { _id, _rev, ...duplicableData } = fetchedData;
          setFilament({
            ...defaultValue, // Start with defaults
            ...duplicableData, // Overwrite with fetched data (minus id/rev)
            used_weight: defaultValue.used_weight, // Reset usage for duplicate? Or keep? Decide based on requirements. Let's reset.
          });
        } else {
          // For edit, set the full fetched data
          setFilament(fetchedData);
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error
            ? err.message
            : "An unknown error occurred during fetch.";
        console.error("Fetch filament error:", err);
        setError(`Failed to load filament data: ${message}`);
        // Keep default/partially loaded data? Or clear? Let's keep for potential user correction.
        // setFilament(defaultValue);
      } finally {
        setIsLoading(false); // Initial load complete (even if fetch failed)
        setIsFetching(false); // Fetch operation finished
      }
    },
    [dbs.filament, operationType]
  ); // Dependencies for the fetch logic

  // 3. Effect to trigger fetch when conditions are met
  useEffect(() => {
    // Only fetch if DB is ready, we have an ID, and type is 'edit' or 'duplicate'
    if (
      isReady &&
      filamentIdToFetch &&
      (operationType === "edit" || operationType === "duplicate")
    ) {
      fetchFilament(filamentIdToFetch);
    } else if (isReady && operationType === "create") {
      // If creating and DB is ready, ensure loading is false
      setIsLoading(false);
    }
    // If !isReady, we should remain in the loading state (handled by initial isLoading=true)
  }, [isReady, filamentIdToFetch, operationType, fetchFilament]); // Dependencies that trigger fetch

  // --- Render Logic ---

  // Loading state (covers initial context readiness and fetch)
  if (isLoading || (!isReady && operationType !== "create")) {
    // Still loading if context isn't ready unless explicitly creating
    return (
      <Container className="text-center my-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading Filament Data...</p>
      </Container>
    );
  }

  // Error state
  if (error && operationType !== "create") {
    // Show critical errors preventing edit/duplicate load
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

  // Determine title based on operation type
  const pageTitle =
    operationType === "edit"
      ? "Edit Filament"
      : operationType === "duplicate"
      ? "Duplicate Filament"
      : "Add Filament";

  // Main content render
  return (
    <Container fluid className="py-3">
      <Row className="justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <div className="shadow-lg p-3 p-md-4 bg-body rounded">
            <h2 className="text-center mb-4">{pageTitle}</h2>
            {isReady && dbs.filament ? (
              <ManageFilament data={filament} db={dbs.filament} />
            ) : (
              // Show message if DB isn't ready (should be rare if isReady check passes above)
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
