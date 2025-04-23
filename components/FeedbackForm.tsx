"use client";

// --- React ---
import React, { useState, useEffect } from "react";
import { Container, Form, Button, Spinner } from "react-bootstrap";
import Select, { MultiValue } from "react-select";
// --- Next ---
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// --- Helpers ---
import { generateGithubLink } from "@/helpers/_silabs/generateGithubLink";
// --- Data ---
import githubLabels from "@/json/github/labels.json";
import githubAssignees from "@/json/github/assignees.json";
import githubTemplates from "@/json/github/templates.json";

// --- Types and Initial State ---
type OptionType = {
  value: string;
  label: string;
};

const initialFeedbackState = {
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

export default function FeedbackForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(initialFeedbackState);

  useEffect(() => {
    if (!searchParams) return;
    if (isLoading) {
      const assigneesString = searchParams.get("assignees") ?? "";
      const labelsString = searchParams.get("labels") ?? "";
      setFormData({
        title: searchParams.get("title") ?? "",
        assignees: parseOptions(assigneesString, githubAssignees),
        labels: parseOptions(labelsString, githubLabels),
        template: searchParams.get("template") ?? "",
        body: searchParams.get("body") ?? "",
      });
      setIsLoading(false);
    }
  }, [searchParams, isLoading]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const label = e.target.name;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const handleChangeSelect = (
    selectedOptions: MultiValue<OptionType> | null,
    name: "assignees" | "labels"
  ) => {
    setFormData((prev) => ({ ...prev, [name]: selectedOptions || [] }));
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
    const githubLink = generateGithubLink(
      process.env.NEXT_PUBLIC_APP_GITHUB_OWNER,
      process.env.NEXT_PUBLIC_APP_GITHUB_REPO,
      feedbackData
    );
    router.replace(githubLink);
  };

  if (isLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="mt-2">Loading Feedback Form...</p>
      </Container>
    );
  }

  return (
    <div className="shadow-lg p-3 p-md-4 bg-body rounded">
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3" controlId="title">
          <Form.Label>Title:</Form.Label>
          <Form.Control
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
          />
        </Form.Group>

        {githubAssignees.length > 0 && (
          <Form.Group className="mb-3" controlId="assignees">
            <Form.Label>Assignees:</Form.Label>
            <Select<OptionType, true>
              isMulti
              options={githubAssignees}
              value={formData.assignees}
              onChange={(opts) => handleChangeSelect(opts, "assignees")}
              closeMenuOnSelect={false}
              placeholder="None"
              aria-label="Select Assignees"
            />
          </Form.Group>
        )}

        {githubLabels.length > 0 && (
          <Form.Group className="mb-3" controlId="labels">
            <Form.Label>Labels:</Form.Label>
            <Select<OptionType, true>
              isMulti
              options={githubLabels}
              value={formData.labels}
              onChange={(opts) => handleChangeSelect(opts, "labels")}
              closeMenuOnSelect={false}
              placeholder="None"
              aria-label="Select Labels"
            />
          </Form.Group>
        )}

        {githubTemplates.length > 0 && (
          <Form.Group className="mb-3" controlId="template">
            <Form.Label>Template:</Form.Label>
            <Form.Select
              name="template"
              value={formData.template || ""}
              onChange={handleInputChange}
              aria-label="Select Template"
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
          <Form.Group className="mb-3" controlId="body">
            <Form.Label>Description:</Form.Label>
            <Form.Control
              as="textarea"
              name="body"
              value={formData.body}
              onChange={handleInputChange}
              rows={5}
              aria-label="Feedback Description"
            />
          </Form.Group>
        )}

        <div className="text-center mt-4 d-flex justify-content-center">
          <Link href="/" passHref>
            <Button variant="outline-secondary" className="me-3">
              Cancel
            </Button>
          </Link>
          <Button variant="primary" type="submit">
            Create GitHub Issue
          </Button>
        </div>
      </Form>
    </div>
  );
}
