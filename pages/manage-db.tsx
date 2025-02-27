import { useEffect, useState } from "react";
import Head from "next/head";
import { Container, Row, Col, Button, Form } from "react-bootstrap";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { initializeFilamentDB } from "@/helpers/filament/initializeFilamentDB";
import { migrateFilamentDB } from "@/helpers/filament/migrateFilamentDB";
import { exportDB } from "@/helpers/exportDB";
import { clearDB } from "@/helpers/clearDB";
import { importDB } from "@/helpers/importDB";

export default function ManageDatabase() {
  const [db, setDb] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importStatus, setImportStatus] = useState<"success" | "error" | null>(
    null
  );

  useEffect(() => {
    setIsLoading(false);

    async function init() {
      const initializedDb = await initializeFilamentDB();
      setDb(initializedDb);
      if (initializedDb) {
        await migrateFilamentDB(initializedDb);
      }
    }
    init();
  }, []);

  const clearDatabase = async () => {
    setIsSpinning(true);

    setTimeout(() => {
      clearDB(db);
      window.location.reload();
      setIsSpinning(false);
    }, 1000);
  };
  const exportDatabase = async () => {
    setIsSpinning(true);

    setTimeout(() => {
      exportDB(db);
      setIsSpinning(false);
    }, 1000);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/json") {
      setSelectedFile(file);
      setImportStatus(null); // Reset status on new file selection
    } else {
      setSelectedFile(null);
      setImportStatus("error"); // Indicate invalid file type
    }
  };

  const handleImport = async () => {
    if (!selectedFile) {
      return;
    }

    setIsSpinning(true);
    setImportStatus(null);

    try {
      const data = await selectedFile.text();
      let jsonData = JSON.parse(data);
      jsonData = jsonData.map((doc) => {
        const { _rev, ...rest } = doc;
        return rest;
      });
      await importDB(db, jsonData);
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
                    onClick={isSpinning ? undefined : clearDatabase}
                  >
                    {isSpinning ? "Clearing Database..." : "Clear Database"}
                  </Button>
                </Col>
                <Col className="text-center">
                  <Button
                    variant="info"
                    className="w-50 me-2"
                    disabled={isSpinning}
                    onClick={isSpinning ? undefined : exportDatabase}
                  >
                    {isSpinning ? "Exporting Database..." : "Export Database"}
                  </Button>
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
                      {isSpinning ? "Importing..." : "Import Data"}
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
