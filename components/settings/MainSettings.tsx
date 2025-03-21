import { useState, useEffect } from "react";
import { Row, Col, Form, Button } from "react-bootstrap";
//Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
//DB
import getAllSettings from "@/helpers/database/settings/getAllSettings";
import saveSettings from "@/helpers/database/settings/saveSettings";
import { useDatabase } from "@/contexts/DatabaseContext";

const tableHeaders = [
  "ID",
  "Filament",
  "Material",
  "Used Weight",
  "Total Weight",
  "Weight Left",
  "Location",
  "Comments",
];

export default function MainSettings() {
  const { dbs, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<{ [key: string]: any }>({});
  const [error, setError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  useEffect(() => {
    async function fetchData() {
      if (dbs.settings) {
        try {
          const allData = await getAllSettings(dbs.settings);
          if (!allData.spoolHeaders) {
            allData.spoolHeaders = {};
            tableHeaders.forEach((header, index) => {
              allData.spoolHeaders[header] = true;
            });
          }
          setData(allData);
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

  const handleCheckboxChange = (header: string, isChecked: boolean) => {
    setData((prevData) => {
      const newData = { ...prevData };
      if (!newData.spoolHeaders) {
        newData.spoolHeaders = {}; // Initialize spoolHeaders if it doesn't exist
      }
      newData.spoolHeaders[header] = isChecked;
      return newData;
    });
  };

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
        <h4 className="text-center">Spools: Show/Hide Columns</h4>
        <hr />
        <Row className="justify-content-center">
          <Col className="d-flex flex-wrap justify-content-center">
            {tableHeaders.map((header) => (
              <div
                key={header}
                className="d-flex"
                style={{ width: "50%", maxWidth: "150px" }}
              >
                <Form.Check
                  type="checkbox"
                  id={`checkbox-${header.replace(/\s/g, "")}`}
                  label={header}
                  className="me-2 custom-checkbox"
                  checked={data?.spoolHeaders?.[header] || false}
                  onChange={(e) =>
                    handleCheckboxChange(header, e.target.checked)
                  }
                />
              </div>
            ))}
          </Col>
        </Row>
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
