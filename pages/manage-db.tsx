import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
//DB
import PouchDB from "pouchdb";
import { testLocalDocs } from "@/helpers/filament/initializeFilamentDB";
import { useDatabase } from "@/contexts/DatabaseContext";
import { exportDB } from "@/helpers/exportDB";
import { clearDB } from "@/helpers/clearDB";
import { importDB } from "@/helpers/importDB";

export default function ManageDatabase() {
  const { db, isLoadingDB } = useDatabase();
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"success" | "error" | null>(
    null
  );
  const [exportError, setExportError] = useState<string | null>(null);

  // Inside your ManageDatabase component, in the useEffect:

  useEffect(() => {
    (async () => {
      if (isLoadingDB === false) {
        const testResult = await testLocalDocs(db);
        console.log("testLocalDocs result in component:", testResult);
      }
    })();
    setIsLoading(false);
  }, [isLoadingDB, db]);

  const clearDatabase = async () => {
    if (!db) return; // Don't proceed if db is null
    setIsSpinning(true);
    try {
      await clearDB(db);
      window.location.reload();
    } catch (error) {
      console.error("Error clearing database:", error);
    } finally {
      setIsSpinning(false);
    }
  };

  const exportDatabase = async () => {
    if (!db) return;
    setIsSpinning(true);
    setExportError(null);
    try {
      await exportDB(db);
    } catch (error) {
      console.error("Failed to export", error);
      setExportError("Failed to export the database. See console for details."); // Set error message
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
        setImportStatus(null); // Reset status on new file selection
      } else {
        setSelectedFile(null);
        setImportStatus("error"); // Indicate invalid file type
      }
    } else {
      setSelectedFile(null); //No file selected
      setImportStatus(null);
    }
  };

  const handleImport = async () => {
    if (!db || !selectedFile) {
      return;
    }

    setIsSpinning(true);
    setImportStatus(null);

    try {
      const data = await selectedFile.text();
      const jsonData = JSON.parse(data);

      // Handle both single array and object with 'regular' and 'local'
      let docsToImport: any[] = [];
      if (Array.isArray(jsonData)) {
        docsToImport = jsonData; // It's a single array of docs
      } else if (jsonData.regular && Array.isArray(jsonData.regular)) {
        docsToImport = docsToImport.concat(jsonData.regular); //It has regular array

        if (jsonData.local && Array.isArray(jsonData.local)) {
          //Check for local array
          docsToImport = docsToImport.concat(jsonData.local); //It has local array
        }
      } else {
        throw new Error("Invalid JSON format for import.");
      }

      await importDB(db, docsToImport);
      setImportStatus("success");
    } catch (error) {
      console.error("Import error:", error);
      setImportStatus("error");
    } finally {
      setIsSpinning(false);
    }
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
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
                    variant="danger"
                    className="w-50 me-2"
                    disabled={isSpinning}
                    onClick={clearDatabase}
                  >
                    Clear Database
                  </Button>
                </Col>
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
                    <Button
                      variant="primary"
                      onClick={handleImport}
                      disabled={!selectedFile || isSpinning}
                    >
                      Import Data
                    </Button>
                    {importStatus === "success" && (
                      <p className="text-success mt-2">
                        Data imported successfully!
                      </p>
                    )}
                    {importStatus === "error" && (
                      <p className="text-danger mt-2">
                        Error importing data. Please check the file format.
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
