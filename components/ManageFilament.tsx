import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
//Types
import { ManageFilamentProps } from "@/types/Filament";

function ManageFilament({ data }: ManageFilamentProps) {
  const [filamentData, setFilamentData] = useState(
    data && Object.keys(data).length > 0
      ? data
      : {
          Filament: "",
          Material: "",
          Used_Weight: "",
          Location: "",
          Comments: "",
        }
  );

  const handleChange = (e) => {
    setFilamentData({
      ...filamentData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Filament Data:", filamentData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Form.Group controlId="filament">
        <Form.Label>Filament:</Form.Label>
        <Form.Control
          type="text"
          name="filament"
          value={filamentData.Filament}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="material">
        <Form.Label>Material:</Form.Label>
        <Form.Control
          type="text"
          name="material"
          value={filamentData.Material}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="usedWeight">
        <Form.Label>Used Weight:</Form.Label>
        <Form.Control
          type="number"
          name="usedWeight"
          value={filamentData.Used_Weight}
          onChange={handleChange}
          min="0"
          required
        />
      </Form.Group>

      <Form.Group controlId="location">
        <Form.Label>Location:</Form.Label>
        <Form.Control
          type="text"
          name="location"
          value={filamentData.Location}
          onChange={handleChange}
          required
        />
      </Form.Group>

      <Form.Group controlId="comments">
        <Form.Label>Comments:</Form.Label>
        <Form.Control
          as="textarea" // Use textarea component
          rows={3} // Set number of rows
          name="comments"
          value={filamentData.Comments}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="text-center mt-2">
        <Button variant="primary" type="submit">
          Submit
        </Button>
      </div>
    </Form>
  );
}

export default ManageFilament;
