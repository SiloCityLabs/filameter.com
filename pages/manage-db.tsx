import { useState, useEffect } from "react";
import Head from "next/head";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//DB
import { useDatabase } from "@/contexts/DatabaseContext";
import { exportDB } from "@/helpers/exportDB";
import { importDB } from "@/helpers/importDB";
import PouchDB from "pouchdb";

export default function ManageDatabase() {
  const { db, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"success" | "error" | null>(
    null
  );
  const [exportError, setExportError] = useState<string | null>(null);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const [clearBeforeImport, setClearBeforeImport] = useState(false); // Re-add clearBeforeImport
  const [triggerImport, setTriggerImport] = useState(false); // New state variable

  // Load selectedFile from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("selectedFile")) {
      const fileData = JSON.parse(localStorage.getItem("selectedFile")!);
      //Need to use File constructor
      const file = new File([new Blob([fileData.content])], fileData.name, {
        type: fileData.type,
      });

      //check for triggerImport
      const shouldTriggerImport =
        localStorage.getItem("triggerImport") === "true";

      setSelectedFile(file);
      localStorage.removeItem("selectedFile");
      if (shouldTriggerImport) {
        setTriggerImport(true); // Set the trigger
        localStorage.removeItem("triggerImport"); // Clear the flag
      }
    }
  }, []);

  useEffect(() => {
    // This effect runs whenever triggerImport changes
    if (triggerImport && db && selectedFile) {
      handleImport(); // Call handleImport
    }
  }, [triggerImport, db, selectedFile]); // Depend on triggerImport

  const exportDatabase = async () => {
    if (!db) return;
    setIsSpinning(true);
    setExportError(null);
    try {
      await exportDB(db);
    } catch (error) {
      console.error("Failed to export", error);
      setExportError("Failed to export the database. See console for details.");
    } finally {
      setIsSpinning(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === "application/json") {
        setSelectedFile(file);
        setImportStatus(null); // Reset import status
        setImportMessage(null); // Clear any previous message
      } else {
        setSelectedFile(null);
        setImportStatus("error");
        setImportMessage("Invalid file type. Please select a JSON file.");
      }
    } else {
      setSelectedFile(null);
      setImportStatus(null); // Reset
      setImportMessage(null);
    }
  };

  const handleImport = async () => {
    if (!db || !selectedFile) {
      return;
    }

    setIsSpinning(true);
    setImportStatus(null);
    setImportMessage(null);

    try {
      // Add this block back:
      if (clearBeforeImport) {
        // Convert file to storable string
        const fileContent = await selectedFile.text();
        const fileData = {
          name: selectedFile.name,
          type: selectedFile.type,
          content: fileContent,
        };
        localStorage.setItem("selectedFile", JSON.stringify(fileData));
        localStorage.setItem("clearDatabase", "true");
        localStorage.setItem("triggerImport", "true"); // Set the trigger flag
        window.location.reload();
        return;
      }

      const data = await selectedFile.text();
      const jsonData = JSON.parse(data);

      if (
        typeof jsonData === "object" &&
        jsonData !== null &&
        Array.isArray(jsonData.regular) &&
        Array.isArray(jsonData.local)
      ) {
        await importDB(db, jsonData);
        setImportStatus("success");
        setImportMessage("Data imported successfully!");
        // No more reload here!
      } else {
        setImportStatus("error");
        setImportMessage(
          "Invalid JSON format. Expected an object with 'regular' and 'local' arrays."
        );
      }
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus("error");
      setImportMessage(
        "Error importing data: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setIsSpinning(false);
    }
  };

  if (!isReady) {
    return <div className="text-center">Loading database...</div>;
  }

  return (
    <>
      <Head>
        <title>{`${process.env.NEXT_PUBLIC_APP_NAME} - Manage Database`}</title>
        <link rel="manifest" href="/manifest.json" />
        <meta name="description" content="" />
        <meta name="keywords" content="" />
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
        <Container className="main-content mt-3">
          <Row className="shadow-lg p-3 bg-body rounded">
            <Col className="text-center">
              <Row>
                <Col className="text-center">
                  <Button
                    variant="info"
                    className="w-50 me-2"
                    disabled={isSpinning}
                    onClick={exportDatabase}
                  >
                    Export Database
                  </Button>
                  {exportError && <p className="text-danger">{exportError}</p>}
                </Col>
              </Row>
              <hr />
              <Row>
                <Col className="text-center">
                  {/* Import Section */}
                  <Form>
                    <Form.Group controlId="formFile" className="mb-3">
                      <Form.Label>Import JSON Database</Form.Label>
                      <Form.Control
                        type="file"
                        accept=".json"
                        onChange={handleFileChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Check
                        type="checkbox"
                        id="clearBeforeImport"
                        label="Clear database before import"
                        checked={clearBeforeImport}
                        onChange={(e) => setClearBeforeImport(e.target.checked)}
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      onClick={handleImport}
                      disabled={!selectedFile || isSpinning}
                    >
                      Import Data
                    </Button>

                    {importMessage && (
                      <p
                        className={
                          importStatus === "success"
                            ? "text-success mt-2"
                            : "text-danger mt-2"
                        }
                      >
                        {importMessage}
                      </p>
                    )}
                  </Form>
                </Col>
              </Row>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}
