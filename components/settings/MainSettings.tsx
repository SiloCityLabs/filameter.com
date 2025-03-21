import { useState, useEffect } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";
//DB
import getAllSettings from "@/helpers/database/settings/getAllSettings";
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
  const { db, isReady } = useDatabase();
  const [isSpinning, setIsSpinning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      if (db) {
        try {
          const allData = await getAllSettings(db);
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
    // Only fetch if DB is ready
    if (isReady) {
      fetchData();
    }
  }, [db, isReady]);

  const handleCheckboxChange = (header: string, isChecked: boolean) => {
    setData((prevData) => {
      const newData = [...prevData];
      if (newData[0] && newData[0].spoolHeaders) {
        newData[0].spoolHeaders[header] = isChecked;
      }
      return newData;
    });

    console.log("Checkbox changed:", header, isChecked);
    console.log("Updated data:", data);
  };

  if (!isReady) {
    return <div className="text-center">Loading database...</div>;
  }

  return (
    <Container className="main-content mt-3">
      <Row className="shadow-lg p-3 bg-body rounded">
        <Col>
          <h4 className="text-center">Spool Settings</h4>
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
                    checked={data[0]?.spoolHeaders?.[header] || false}
                    onChange={(e) =>
                      handleCheckboxChange(header, e.target.checked)
                    }
                  />
                </div>
              ))}
            </Col>
          </Row>
        </Col>
      </Row>
    </Container>
  );
}
