'use client';

// --- React ---
import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Spinner } from 'react-bootstrap';
import Select, { MultiValue, StylesConfig } from 'react-select';
// --- Next ---
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
// --- Helpers ---
import { generateGithubLink } from '@silocitypages/utils';
// --- Data ---
import githubLabels from './config/labels.json';
import githubAssignees from './config/assignees.json';
import githubTemplates from './config/templates.json';
// --- Styles ---
import styles from '@/public/styles/components/Feedback.module.css';
// --- Font Awesome ---
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faTimes } from '@fortawesome/free-solid-svg-icons';

// --- Types and Initial State ---
type OptionType = { value: string; label: string };

const initialFeedbackState = {
  title: '',
  assignees: [] as OptionType[],
  labels: [] as OptionType[],
  template: '',
  body: '',
};

const parseOptions = (valueString: string, options: OptionType[]): OptionType[] => {
  if (!valueString) return [];
  const uniqueValues = new Set(valueString.split(',').map((v) => v.trim()));
  return Array.from(uniqueValues)
    .map((value) => options.find((option) => option.value === value))
    .filter((option): option is OptionType => option !== undefined);
};

// Custom styles for react-select to match react-bootstrap
const selectStyles: StylesConfig<OptionType, true> = {
  control: (base) => ({
    ...base,
    borderRadius: '8px',
    borderColor: '#ced4da',
    padding: '0.225rem 0.4rem',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    '&:hover': { borderColor: '#adb5bd' },
  }),
  menu: (base) => ({ ...base, borderRadius: '8px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: 'var(--background-light)',
    borderRadius: '4px',
  }),
  multiValueLabel: (base) => ({ ...base, color: 'var(--primary-color)', fontWeight: 500 }),
  multiValueRemove: (base) => ({
    ...base,
    color: 'var(--primary-color)',
    '&:hover': { backgroundColor: 'var(--primary-color)', color: 'white' },
  }),
};

export default function FeedbackForm() {
  // --- STATE AND LOGIC (UNCHANGED FROM YOUR ORIGINAL) ---
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState(initialFeedbackState);

  useEffect(() => {
    if (!searchParams) return;
    if (isLoading) {
      const assigneesString = searchParams.get('assignees') ?? '';
      const labelsString = searchParams.get('labels') ?? '';
      setFormData({
        title: searchParams.get('title') ?? '',
        assignees: parseOptions(assigneesString, githubAssignees),
        labels: parseOptions(labelsString, githubLabels),
        template: searchParams.get('template') ?? '',
        body: searchParams.get('body') ?? '',
      });
      setIsLoading(false);
    }
  }, [searchParams, isLoading]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const label = e.target.name;
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, [label]: value }));
  };

  const handleChangeSelect = (
    selectedOptions: MultiValue<OptionType> | null,
    name: 'assignees' | 'labels'
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

  // --- JSX / STYLING (UPDATED) ---
  if (isLoading) {
    return (
      <Container className='text-center py-5'>
        <Spinner animation='border' variant='primary' role='status'>
          <span className='visually-hidden'>Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Form onSubmit={handleSubmit} className={styles.feedbackForm}>
      <Form.Group className='mb-3' controlId='title'>
        <Form.Label>Title</Form.Label>
        <Form.Control
          type='text'
          name='title'
          value={formData.title}
          onChange={handleInputChange}
          placeholder='A brief title for your feedback'
          required
        />
      </Form.Group>

      {githubAssignees.length > 0 && (
        <Form.Group className='mb-3' controlId='assignees'>
          <Form.Label>Assignees</Form.Label>
          <Select<OptionType, true>
            isMulti
            options={githubAssignees}
            value={formData.assignees}
            onChange={(opts) => handleChangeSelect(opts, 'assignees')}
            closeMenuOnSelect={false}
            placeholder='Select assignees...'
            aria-label='Select Assignees'
            styles={selectStyles}
          />
        </Form.Group>
      )}

      {githubLabels.length > 0 && (
        <Form.Group className='mb-3' controlId='labels'>
          <Form.Label>Labels</Form.Label>
          <Select<OptionType, true>
            isMulti
            options={githubLabels}
            value={formData.labels}
            onChange={(opts) => handleChangeSelect(opts, 'labels')}
            closeMenuOnSelect={false}
            placeholder='Select labels...'
            aria-label='Select Labels'
            styles={selectStyles}
          />
        </Form.Group>
      )}

      {githubTemplates.length > 0 && (
        <Form.Group className='mb-3' controlId='template'>
          <Form.Label>Template</Form.Label>
          <Form.Select
            name='template'
            value={formData.template || ''}
            onChange={handleInputChange}
            aria-label='Select Template'>
            <option value=''>None</option>
            {githubTemplates.map((template) => (
              <option key={template.value} value={template.value}>
                {template.label}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      )}

      {formData.template === '' && (
        <Form.Group className='mb-3' controlId='body'>
          <Form.Label>Description</Form.Label>
          <Form.Control
            as='textarea'
            name='body'
            value={formData.body}
            onChange={handleInputChange}
            rows={6}
            aria-label='Feedback Description'
            placeholder='Please provide a detailed description...'
          />
        </Form.Group>
      )}

      <div className='mt-4 d-flex justify-content-end gap-2'>
        <Link href='/' passHref>
          <Button variant='outline-secondary' size='sm'>
            <FontAwesomeIcon icon={faTimes} className='me-2' />
            Cancel
          </Button>
        </Link>
        <Button variant='primary' type='submit' size='sm'>
          <FontAwesomeIcon icon={faPaperPlane} className='me-2' />
          Create GitHub Issue
        </Button>
      </div>
    </Form>
  );
}
