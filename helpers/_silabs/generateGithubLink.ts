export function generateGithubLink(
    owner: string = "SiloCityLabs",
    repo: string,
    params: {
        title?: string;
        body?: string;
        labels?: string[] | string;
        assignees?: string[] | string;
        milestone?: string | number;
        template?: string;
    }
): string {

    const url = new URL(`https://github.com/${owner}/${repo}/issues/new`);
    const searchParams = url.searchParams;

    // Helper function to append parameters, handling encoding
    const appendParam = (key: string, value: string | number | undefined | null) => {
        if (value !== undefined && value !== null && value !== "") {
            searchParams.append(key, String(value));
        }
    };

    // Add title
    appendParam("title", params.title);

    // Add body (only if no template)
    if (!params.template) {
        appendParam("body", params.body);
    }
    // Add labels (handling both single string and array)
    if (params.labels) {
        if (Array.isArray(params.labels)) {
            if (params.labels.length > 0) {
                appendParam("labels", params.labels.join(","));
            }
        } else {
            appendParam("labels", params.labels);
        }
    }

    // Add assignees (handling both single string and array)
    if (params.assignees) {
        if (Array.isArray(params.assignees)) {
            if (params.assignees.length > 0) {
                appendParam("assignees", params.assignees.join(","));
            }
        } else {
            appendParam("assignees", params.assignees);
        }
    }

    // Add milestone
    appendParam("milestone", params.milestone);

    // Add template
    appendParam("template", params.template);

    return url.toString();
}