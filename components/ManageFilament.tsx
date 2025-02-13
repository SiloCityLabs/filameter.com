import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
//Components
import CustomAlert from "@/components/bootstrap/CustomAlert";
//Types
import { ManageFilamentProps, Filament } from "@/types/Filament";
//DB
import { addFilament } from "@/helpers/addFilament";
import { initializeFilamentDB } from "@/helpers/initializeFilamentDB";

const defaultValue: Filament = {
  filament: "",
  material: "",
  used_weight: 0,
  location: "",
  comments: "",
};

function ManageFilament({ data }: ManageFilamentProps) {
  const [showAlert, setShowAlert] = useState(false);
  const [alertVariant, setAlertVariant] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [db, setDb] = useState(null);
  const [formData, setFormData] = useState(
    data && Object.keys(data).length > 0 ? data : defaultValue
  );
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    async function init() {
      const initializedDb = await initializeFilamentDB();
      setDb(initializedDb);
    }
    init();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFormErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await addFilament(db, formData); // Pass the db and formData

    if (result.success) {
      console.log("Filament added successfully:", result.data);
      setFormData(defaultValue);
      setShowAlert(true);
      setAlertMessage("Filament added successfully");
    } else {
      console.error("Error adding filament:", result.error);
      if (typeof result.error === "object") {
        // Check if it's Joi error details
        const formattedErrors = {};
        result.error.forEach((err) => {
          formattedErrors[err.path[0]] = err.message;
        });
        setFormErrors(formattedErrors);
      }
    }
  };

  interface AlertProps {
    variant: string;
    message: string;
    show: boolean;
    onClose: () => void;
  }
  return (
    <>
      <CustomAlert
        variant={alertVariant ? alertVariant : "success"}
        message={alertMessage}
        show={showAlert}
        onClose={() => setShowAlert(false)}
      />
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="filament">
          <Form.Label>Filament:</Form.Label>
          <Form.Control
            type="text"
            name="filament"
            value={formData.filament}
            onChange={handleInputChange}
            required
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

        <Form.Group controlId="location">
          <Form.Label>Location:</Form.Label>
          <Form.Control
            type="text"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            required
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

        <div className="text-center mt-2">
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </div>
      </Form>
    </>
  );
}

export default ManageFilament;
