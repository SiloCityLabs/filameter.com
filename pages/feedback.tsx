import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import Select, { MultiValue } from "react-select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { generateGithubLink } from "@/helpers/_silabs/generateGithubLink";
//json
import githubLabels from "@/json/github/labels.json";
import githubAssignees from "@/json/github/assignees.json";
import githubTemplates from "@/json/github/templates.json";

type OptionType = {
  value: string;
  label: string;
};

const feedback = {
  title: "",
  assignees: [] as OptionType[],
  labels: [] as OptionType[],
  template: "",
  body: "",
};

const parseOptions = (
  valueString: string,
  options: OptionType[]
): OptionType[] => {
  if (!valueString) return [];

  const uniqueValues = new Set(valueString.split(",").map((v) => v.trim()));

  return Array.from(uniqueValues)
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is OptionType => option !== undefined);
};

export default function Feedback() {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(feedback);
  const router = useRouter();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const assigneesString = urlParams.get("assignees") ?? "";
    const labelsString = urlParams.get("labels") ?? "";

    setFormData({
      title: urlParams.get("title") ?? "",
      assignees: parseOptions(assigneesString, githubAssignees),
      labels: parseOptions(labelsString, githubLabels),
      template: urlParams.get("template") ?? "",
      body: urlParams.get("body") ?? "",
    });
    setIsLoading(false);
  }, []);

  const handleInputChange = (e) => {
    const value = e.value ? e : e.target.value;
    const label = e.value ? "template" : e.target.name;
    setFormData({ ...formData, [label]: value });
  };

  const handleChangeSelect = (
    selectedOptions: MultiValue<OptionType> | null,
    name: "assignees" | "labels"
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: selectedOptions || [],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const feedbackData = {
      title: formData.title,
      assignees: formData.assignees.map((item) => item.value),
      labels: formData.labels.map((item) => item.value),
      template: formData.template,
      body: formData.body,
    };

    router.replace(
      generateGithubLink(
        process.env.NEXT_PUBLIC_APP_GITHUB_OWNER,
        process.env.NEXT_PUBLIC_APP_GITHUB_REPO,
        feedbackData
      )
    );
  };

  if (isLoading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>Feedback</title>
      </Head>
      <div className="main-container">
        <Header showBadge={true} />
        <Container className="main-content">
          <h3 className="text-center mt-4">Feedback</h3>
          <Row className="shadow-lg p-3 bg-body rounded mt-4">
            <Col>
              <Form onSubmit={handleSubmit}>
                <Form.Group controlId="title">
                  <Form.Label>Title:</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </Form.Group>

                {githubAssignees.length > 0 && (
                  <Form.Group controlId="assignees">
                    <Form.Label>Assignees:</Form.Label>
                    <Select
                      isMulti
                      options={githubAssignees}
                      value={formData.assignees}
                      onChange={(selectedOptions) =>
                        handleChangeSelect(selectedOptions, "assignees")
                      }
                      closeMenuOnSelect={false}
                      placeholder="None"
                    />
                  </Form.Group>
                )}

                {githubLabels.length > 0 && (
                  <Form.Group controlId="labels">
                    <Form.Label>Labels:</Form.Label>
                    <Select
                      isMulti
                      options={githubLabels}
                      value={formData.labels}
                      onChange={(selectedOptions) =>
                        handleChangeSelect(selectedOptions, "labels")
                      }
                      closeMenuOnSelect={false}
                      placeholder="None"
                    />
                  </Form.Group>
                )}

                {githubTemplates.length > 0 && (
                  <Form.Group controlId="template">
                    <Form.Label>Template:</Form.Label>
                    <Form.Select
                      name="template"
                      value={formData.template || ""}
                      onChange={handleInputChange}
                    >
                      <option value="">None</option>
                      {githubTemplates.map((template) => (
                        <option key={template.value} value={template.value}>
                          {template.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                )}

                {formData.template === "" && (
                  <Form.Group controlId="body">
                    <Form.Label>Description:</Form.Label>
                    <Form.Control
                      as="textarea"
                      name="body"
                      value={formData.body}
                      onChange={handleInputChange}
                      rows={5}
                    />
                  </Form.Group>
                )}

                <div className="text-center mt-2 d-flex justify-content-center">
                  <Button href="/" variant="secondary" className="me-2">
                    Cancel
                  </Button>
                  <Button variant="secondary" type="submit">
                    Create
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Container>
        <Footer />
      </div>
    </>
  );
}