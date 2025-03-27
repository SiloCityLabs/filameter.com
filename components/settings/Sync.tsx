import { useState, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
//Helpers
import { isValidEmail } from "@/helpers/isValidEmail";
import { setupSync } from "@/helpers/sync/setupSync";
//Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
//DB
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import saveSettings from "@/helpers/database/settings/saveSettings";
import { useDatabase } from "@/contexts/DatabaseContext";

export default function Sync() {
  const { dbs, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [initialType, setInitialType] = useState("");
  const [syncEmail, setSyncEmail] = useState("");

  const handleEmailChange = (event) => {
    setSyncEmail(event.target.value);
  };

  useEffect(() => {
    async function fetchData() {
      if (dbs.settings) {
        try {
          const sclSync = await getDocumentByColumn(
            dbs.settings,
            "name",
            "scl-sync",
            "settings"
          );
          console.log("sclSync", sclSync);
          setData(sclSync);
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch settings.";
          setError(errorMessage);
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (isReady) {
      fetchData();
    }
  }, [dbs, isReady]);

  const save = async () => {
    if (!dbs.settings) {
      console.error("Database is not initialized.");
      return;
    }

    setIsSpinning(true);

    try {
      await saveSettings(dbs.settings, data);
    } catch (error: unknown) {
      console.error("Error saving settings:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unknown error occurred while saving settings.");
      }
    } finally {
      setIsSpinning(false);
      setShowAlert(true);
      setAlertMessage("Settings Saved!");
    }
  };

  const createSync = async (email) => {
    if (!isValidEmail(email)) {
      setError("Invalid email address.");
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Invalid Email!");
      return;
    }

    console.log("createSync with email:", email);

    try {
      //perform async tasks
      const response = await setupSync(email);
      console.log("response", response);
      setShowAlert(true);
      setAlertVariant("success");
      setAlertMessage("Sync Created!");
    } catch (error) {
      setError("Sync failed.");
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Sync Failed!");
    }
  };

  const existingKey = async () => {
    console.log("createSync");

    return;
  };

  if (!isReady || isLoading) {
    return <div className="text-center">Loading database...</div>;
  }

  return (
    <Row>
      <Col>
        <CustomAlert
          variant={alertVariant ? alertVariant : "success"}
          message={alertMessage}
          show={showAlert}
          onClose={() => setShowAlert(false)}
        />
        {initialType === "" && (
          <Row className="justify-content-center align-items-center">
            <Col xs="auto">
              <Button
                variant="primary"
                className="w-100"
                disabled={isSpinning}
                onClick={() => setInitialType("setup")}
              >
                Setup Sync
              </Button>
            </Col>
            <Col xs="auto" className="text-center">
              OR
            </Col>
            <Col xs="auto">
              <Button
                variant="primary"
                className="w-100"
                disabled={isSpinning}
                onClick={() => setInitialType("key")}
              >
                Use Existing Key
              </Button>
            </Col>
          </Row>
        )}
        {initialType === "setup" && (
          <Row className="justify-content-center align-items-center">
            <Col xs={12} md={6}>
              <Form.Group controlId="syncEmail">
                <Form.Label>Sync Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter sync email"
                  value={syncEmail}
                  onChange={handleEmailChange}
                  required
                />
              </Form.Group>
            </Col>
            <Row className="justify-content-center align-items-center mt-3">
              <Col xs="auto">
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={isSpinning}
                  onClick={() => setInitialType("")}
                >
                  Cancel
                </Button>
              </Col>
              <Col xs="auto">
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={isSpinning}
                  onClick={async () => {
                    await createSync(syncEmail);
                  }}
                >
                  Finish Setup
                </Button>
              </Col>
            </Row>
          </Row>
        )}
        {initialType === "key" && (
          <Row className="justify-content-center align-items-center">key</Row>
        )}
        <Row className="mt-5 justify-content-center">
          <Col xs={12} sm={6} md={3}>
            <div className="d-flex justify-content-center">
              <Button
                variant="primary"
                className="w-100"
                disabled={isSpinning}
                onClick={save}
              >
                Save Settings
              </Button>
            </div>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
