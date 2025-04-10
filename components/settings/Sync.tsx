import { useState, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
//Helpers
import { isValidEmail } from "@/helpers/isValidEmail";
import { setupSyncByEmail } from "@/helpers/sync/setupSyncByEmail";
import { setupSyncByKey } from "@/helpers/sync/setupSyncByKey";
import { pushData } from "@/helpers/sync/pushData";
//Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
//DB
import getDocumentByColumn from "@/helpers/_silabs/pouchDb/getDocumentByColumn";
import saveSettings from "@/helpers/database/settings/saveSettings";
import { useDatabase } from "@/contexts/DatabaseContext";
import { exportDB } from "@/helpers/exportDB";
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
  const [dbExport, setDbExport] = useState({});

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  useEffect(() => {
    async function fetchData() {
      if (dbs.settings && dbs.filament) {
        try {
          setIsLoading(true);

          //Get Sync Data
          const sclSync = await getDocumentByColumn(
            dbs.settings,
            "name",
            "scl-sync",
            "settings"
          );
          if (sclSync && sclSync.value !== "") {
            setData(JSON.parse(sclSync.value));
            setInitialType("engaged");
          }

          //Get Filament Export Data
          const exportData = (await exportDB(dbs.filament, false)) ?? {};
          setDbExport(exportData);
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
    } else {
      setIsLoading(true);
    }
  }, [dbs, isReady]);

  const save = async (saveData: sclSettings) => {
    if (!dbs?.settings) {
      console.error("Settings database is not initialized.");
      setAlertMessage("Database not ready. Cannot save settings.");
      setAlertVariant("warning");
      setShowAlert(true);
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
        setAlertVariant("success");
        setAlertMessage("Sync Created!");
      } else if (response.status === "error") {
        setShowAlert(true);
        setAlertVariant("danger");
        setAlertMessage(response.error);
      }
      setShowAlert(true);
    } catch (error) {
      console.error("Failed to export", error);
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Sync Failed!");
    }
    setIsSpinning(false);
  };

  const existingKey = async () => {
    if (!syncKey) {
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Key is required!");
      return;
    }
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
        setAlertVariant("success");
        setAlertMessage("Sync setup with key!");
      } else if (response.status === "error") {
        setShowAlert(true);
        setAlertVariant("danger");
        setAlertMessage(response.error);
      }
      setShowAlert(true);
    } catch (error) {
      console.error("Failed to export", error);
      setShowAlert(true);
      setAlertVariant("danger");
      setAlertMessage("Sync Failed!");
    }
    setIsSpinning(false);
  };

  const syncData = async () => {
    try {
      setIsSpinning(true);
      const response = await pushData(data?.syncKey, dbExport);
      if (response.status === "success") {
        //TODO: Do stuff
        setAlertVariant("success");
        setAlertMessage("Data has been synced to the cloud!");
      } else if (response.status === "error") {
        setShowAlert(true);
        setAlertVariant("danger");
        setAlertMessage(response.error);
      }
      setShowAlert(true);
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

    setInitialType("");
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
              <Col xs="auto">Last Synced?: Add a Date Bro</Col>
              <Col xs="auto">Account Type: {data?.accountType || "Free"}</Col>
            </Row>
            <Row className="mt-4 justify-content-center align-items-center">
              <Col xs="auto">
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={isSpinning}
                  onClick={() => {
                    removeSync();
                  }}
                >
                  Remove Sync
                </Button>
              </Col>
              <Col xs="auto">
                <Button
                  variant="primary"
                  className="w-100"
                  disabled={isSpinning}
                  onClick={async () => {
                    await syncData();
                  }}
                >
                  Sync Now
                </Button>
              </Col>
            </Row>
          </>
        )}
      </Col>
    </Row>
  );
}
