import { useState, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
//Helpers
import { isValidEmail } from "@/helpers/isValidEmail";
import { setupSyncByEmail } from "@/helpers/sync/setupSyncByEmail";
import { setupSyncByKey } from "@/helpers/sync/setupSyncByKey";
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
  const [syncKey, setSyncKey] = useState("");

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
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
          if (sclSync[0] && sclSync[0].value !== "") {
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
      setShowAlert(true);
    } finally {
      setIsSpinning(false);
    }
  };

  const createSync = async () => {
    if (!isValidEmail(syncEmail)) {
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Invalid Email!");
      return;
    }

    try {
      setIsSpinning(true);
      const response = await setupSyncByEmail(syncEmail);
      if (response.status === "success") {
        data.email = syncEmail;
        data.syncKey = response.key;
        setData(data);
        save({ "scl-sync": data });
        setInitialType("engaged");
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
    setIsSpinning(false);
  };

  const existingKey = async () => {
    try {
      setIsSpinning(true);
      const response = await setupSyncByKey(syncKey);
      if (response.status === "success") {
        const keyData = {
          syncKey: response.token,
          ...response.userData,
        };
        setData(keyData);
        save({ "scl-sync": keyData });
        setInitialType("engaged");
      } else if (response.status === "error") {
        setShowAlert(true);
        setAlertVariant("danger");
        setAlertMessage(response.error);
        return;
      }
      setShowAlert(true);
      setAlertVariant("success");
      setAlertMessage("Sync setup with key!");
    } catch (error) {
      console.error("Failed to export", error);
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Sync Failed!");
    }
    setIsSpinning(false);
  };

  const removeSync = async () => {
    if (!window.confirm("Are you sure you want to remove your sync?")) {
      return;
    }

    setData({});
    save({ "scl-sync": "" });
    setAlertMessage("Sync Removed");
    setShowAlert(true);
    setAlertVariant("info");
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
                onClick={() => setInitialType("setupEmail")}
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
                onClick={() => setInitialType("setupKey")}
              >
                Use Existing Key
              </Button>
            </Col>
          </Row>
        )}
        {initialType === "setupEmail" && (
          <Row className="justify-content-center align-items-center">
            <Col xs={12} md={6}>
              <Form.Group controlId="syncEmail">
                <Form.Label>Sync Email</Form.Label>
                <Form.Control
                  type="email"
                  placeholder="Enter sync email"
                  value={syncEmail}
                  onChange={handleInputChange(setSyncEmail)}
                  disabled={isSpinning}
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
                    await createSync();
                  }}
                >
                  Finish Setup
                </Button>
              </Col>
            </Row>
          </Row>
        )}
        {initialType === "setupKey" && (
          <Row className="justify-content-center align-items-center">
            <Col xs={12} md={6}>
              <Form.Group controlId="syncKey">
                <Form.Label>Sync Key</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter sync key"
                  value={syncKey}
                  onChange={handleInputChange(setSyncKey)}
                  disabled={isSpinning}
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
                    await existingKey();
                  }}
                >
                  Finish Setup
                </Button>
              </Col>
            </Row>
          </Row>
        )}
        {initialType === "engaged" && (
          <>
            <Row className="justify-content-center align-items-center">
              <Col xs="auto">Email: {data?.email}</Col>
              <Col xs="auto">Key: {data?.syncKey}</Col>
              <Col xs="auto">Account Type: {data?.accountType || "Free"}</Col>
            </Row>
            <Row className="mt-4 justify-content-center align-items-center">
              <Col xs="auto">
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={isSpinning}
                  onClick={() => {
                    setInitialType("");
                    removeSync();
                  }}
                >
                  Remove Sync
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Col>
    </Row>
  );
}
