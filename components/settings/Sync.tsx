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
//Types
import { sclSettings } from "@/types/_fw";

export default function Sync() {
  const { dbs, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<sclSettings>({});
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
          console.log("sclSync", sclSync[0]);
          if (sclSync[0]) {
            setData(JSON.parse(sclSync[0].value));
            setInitialType("engaged");
          }
        } catch (err: unknown) {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch settings.";
          setAlertMessage(errorMessage);
          setShowAlert(true);
          setAlertVariant("danger");
        } finally {
          setIsLoading(false);
        }
      }
    }
    if (isReady) {
      fetchData();
    }
  }, [dbs, isReady]);

  const save = async (saveData: sclSettings) => {
    if (!dbs.settings) {
      console.error("Database is not initialized.");
      return;
    }

    setIsSpinning(true);

    try {
      await saveSettings(dbs.settings, saveData);
    } catch (error: unknown) {
      console.error("Error saving settings:", error);
      if (error instanceof Error) {
        setAlertMessage(error.message);
      } else {
        setAlertMessage("An unknown error occurred while saving settings.");
      }
      setShowAlert(true);
      setAlertVariant("danger");
    } finally {
      setIsSpinning(false);
      setShowAlert(true);
      setAlertMessage("Settings Saved!");
    }
  };

  const createSync = async (email) => {
    if (!isValidEmail(email)) {
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Invalid Email!");
      return;
    }

    console.log("createSync with email:", email);

    try {
      const response = await setupSync(email);
      console.log("response", response);
      if (response.status === "success") {
        data.email = email;
        data.syncKey = response.key;
        console.log("data", data);
        setData(data);
        save({ "scl-sync": data });
      } else if (response.status === "error") {
        setShowAlert(true);
        setAlertVariant("danger");
        setAlertMessage(response.error);
        return;
      }
      setShowAlert(true);
      setAlertVariant("success");
      setAlertMessage("Sync Created!");
    } catch (error) {
      console.error("Failed to export", error);
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Sync Failed!");
    }
  };

  // const existingKey = async () => {
  //   console.log("createSync");

  //   return;
  // };

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
        {initialType === "engaged" && (
          <Row className="justify-content-center align-items-center">
            <Col xs="auto">Email: {data?.email}</Col>
            <Col xs="auto">Key: {data?.syncKey}</Col>
          </Row>
        )}
      </Col>
    </Row>
  );
}
