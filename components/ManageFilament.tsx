import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Form, Button } from "react-bootstrap";
//Components
import CustomAlert from "@/components/_silabs/bootstrap/CustomAlert";
//Types
import { ManageFilamentProps, Filament } from "@/types/Filament";
//DB
import { saveFilament } from "@/helpers/filament/saveFilament";

const defaultValue: Filament = {
  filament: "",
  material: "",
  used_weight: 0,
  total_weight: 1000,
  location: "",
  comments: "",
};

function ManageFilament({ data, db }: ManageFilamentProps) {
  const router = useRouter();
  const [isEdit, setIsEdit] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [formData, setFormData] = useState(
    data && Object.keys(data).length > 0 ? data : defaultValue
  );
  const [formErrors, setFormErrors] = useState({});
  const [createMultiple, setCreateMultiple] = useState(false);
  const [numberOfRows, setNumberOfRows] = useState(1);

  useEffect(() => {
    if (data?._id && data?._rev) {
      setIsEdit(true);
    }
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!db) {
      setAlertVariant("danger");
      setAlertMessage("Database not initialized.");
      setShowAlert(true);
      return;
    }

    const type = isEdit ? "updated" : "added";
    let result;
    for (let x = 0; x < numberOfRows; x++) {
      result = await saveFilament(db, formData);
    }

    if (result.success) {
      setShowAlert(true);
      setAlertMessage(`Filament ${type} successfully`);

      //Clear form data if adding
      if (!isEdit) {
        router.replace("/spools");
      }
    } else {
      console.error(`Error: Filament not ${type}:`, result.error);
      if (
        typeof result.error === "object" &&
        result.error !== null &&
        Array.isArray(result.error)
      ) {
        //more robust check
        const formattedErrors = {};
        result.error.forEach((err) => {
          if (err?.path?.[0]) {
            //check if path exists
            formattedErrors[err.path[0]] = err.message;
          }
        });
        setFormErrors(formattedErrors);
      } else {
        // Handle other error types (e.g., network errors)
        setAlertVariant("danger");
        setAlertMessage("An unexpected error occurred.");
        setShowAlert(true);
      }
    }
  };

  return (
    <>
      <CustomAlert
        variant={alertVariant ? alertVariant : "success"}
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      />
      <Form onSubmit={handleSubmit}>
        {formData._id && (
          <Form.Group controlId="_id">
            <Form.Label>ID:</Form.Label>
            <Form.Control
              type="text"
              name="_id"
              value={formData._id}
              disabled={true}
            />
          </Form.Group>
        )}

        <Form.Group controlId="filament">
          <Form.Label>Filament:</Form.Label>
          <Form.Control
            type="text"
            name="filament"
            value={formData.filament}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group controlId="material">
          <Form.Label>Material:</Form.Label>
          <Form.Control
            type="text"
            name="material"
            value={formData.material}
            onChange={handleInputChange}
            required
          />
        </Form.Group>

        <Form.Group controlId="usedWeight">
          <Form.Label>Used Weight:</Form.Label>
          <Form.Control
            type="number"
            name="used_weight"
            value={formData.used_weight}
            onChange={handleInputChange}
            min="0"
            required
          />
        </Form.Group>

        <Form.Group controlId="totalWeight">
          <Form.Label>Total Weight:</Form.Label>
          <Form.Control
            type="number"
            name="total_weight"
            value={formData.total_weight}
            onChange={handleInputChange}
            min="0"
            required
          />
        </Form.Group>

        <Form.Group controlId="location">
          <Form.Label>Location:</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />
        </Form.Group>

        <Form.Group controlId="comments">
          <Form.Label>Comments:</Form.Label>
          <Form.Control
            as="textarea" // Use textarea component
            rows={3} // Set number of rows
            name="comments"
            value={formData.comments}
            onChange={handleInputChange}
          />
        </Form.Group>
        {!isEdit && (
          <Form.Group controlId="createMultiple">
            <Form.Check
              type="checkbox"
              label="Create multiple rows"
              checked={createMultiple}
              onChange={(e) => setCreateMultiple(e.target.checked)}
            />
          </Form.Group>
        )}

        {createMultiple && !isEdit && (
          <Form.Group controlId="numberOfRows">
            <Form.Label>Number of rows:</Form.Label>
            <Form.Control
              type="number"
              value={numberOfRows}
              onChange={(e) => setNumberOfRows(parseInt(e.target.value))}
              min={1}
              max={50}
            />
          </Form.Group>
        )}

        <div className="text-center mt-2 d-flex justify-content-center">
          <Button href="/spools" variant="primary" className="me-2">
            {isEdit ? "Back to Spools" : "Cancel"}
          </Button>
          <Button variant="primary" type="submit">
            Save
          </Button>
        </div>
      </Form>
    </>
  );
}

export default ManageFilament;
