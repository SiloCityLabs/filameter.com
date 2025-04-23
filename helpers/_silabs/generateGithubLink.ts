type LinkParams = {
  title?: string;
  body?: string;
  labels?: string[] | string;
  assignees?: string[] | string;
  milestone?: string | number;
  template?: string;
};

/**
 * Generates a GitHub URL for creating a new issue with pre-filled parameters.
 *
 * @param {string}  owner - The owner of the repository (e.g., "SiloCityLabs"). Defaults to "SiloCityLabs".
 * @param {string}  repo - The name of the repository (e.g., "my-repo").
 * @param {LinkParams} params - An object containing the issue's parameters like title, body, labels, assignees, milestone, and template.
 *  - title: The title of the issue.
 *  - body: The body/description of the issue. Only used if no template is provided.
 *  - labels: A single label string or an array of label strings.
 *  - assignees: A single assignee string or an array of assignee strings.
 *  - milestone: The milestone number or name.
 *  - template: The issue template name.
 *
 * @returns {string} The string with the first letter of each word capitalized.
 */
export function generateGithubLink(
  owner: string = "SiloCityLabs",
  repo: string = "",
  params: LinkParams
): string {
  const url = new URL(`https://github.com/${owner}/${repo}/issues/new`);
  const searchParams = url.searchParams;

  // Helper function to append parameters to the URL, handling encoding.
  const appendParam = (
    // Key-value pair for the query parameters, with type definition
    key: string,
    value: string | number | undefined | null
  ) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  };

  // Add title to the search parameters.
  appendParam("title", params.title);

  // Add body to the search parameters if no template is specified.
  if (!params.template) {
    appendParam("body", params.body);
  }
  // Add labels to the search parameters, handling both single string and array formats.
  if (params.labels) {
    if (Array.isArray(params.labels)) {
      // If labels is an array, join them with a comma
      if (params.labels.length > 0) {
        appendParam("labels", params.labels.join(","));
      }
    } else {
      // If labels is not an array, add it directly

      appendParam("labels", params.labels);
    }
  }

  // Add assignees (handling both single string and array)
  if (params.assignees) {
    if (Array.isArray(params.assignees)) {
      // If assignees is an array, join them with a comma
      if (params.assignees.length > 0) {
        appendParam("assignees", params.assignees.join(","));
      }
    } else {
      // If assignees is not an array, add it directly
      appendParam("assignees", params.assignees);
    }
  }

  // Add milestone to the search parameters.
  appendParam("milestone", params.milestone);

  // Add template to the search parameters.
  appendParam("template", params.template);

  return url.toString();
}
