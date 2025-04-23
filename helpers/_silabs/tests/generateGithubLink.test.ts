import { generateGithubLink } from "@/helpers/_silabs/generateGithubLink";

describe("generateGithubLink", () => {
  it("Correctly generates a link with a title, body, single label, and single assignee", () => {
    const link = generateGithubLink("testOwner", "testRepo", {
      title: "Test Title",
      body: "Test Body",
      labels: "testLabel",
      assignees: "testAssignee",
    });
    expect(link).toBe(
      "https://github.com/testOwner/testRepo/issues/new?title=Test+Title&body=Test+Body&labels=testLabel&assignees=testAssignee"
    );
  });

  it("Correctly generates a link with multiple labels and multiple assignees", () => {
    const link = generateGithubLink("testOwner", "testRepo", {
      title: "Test Title",
      body: "Test Body",
      labels: ["label1", "label2"],
      assignees: ["assignee1", "assignee2"],
    });
    expect(link).toBe(
      "https://github.com/testOwner/testRepo/issues/new?title=Test+Title&body=Test+Body&labels=label1%2Clabel2&assignees=assignee1%2Cassignee2"
    );
  });

  it("Correctly generates a link with a milestone and template", () => {
    const link = generateGithubLink("testOwner", "testRepo", {
      title: "Test Title",
      milestone: 1,
      template: "testTemplate",
    });
    expect(link).toBe(
      "https://github.com/testOwner/testRepo/issues/new?title=Test+Title&milestone=1&template=testTemplate"
    );
  });

  it("Correctly generates a link with no params", () => {
    const link = generateGithubLink("testOwner", "testRepo", {});
    expect(link).toBe("https://github.com/testOwner/testRepo/issues/new");
  });

  it("Correctly handles labels and assignees provided as strings", () => {
    const link = generateGithubLink("testOwner", "testRepo", {
      title: "Test Title",
      labels: "singleLabel",
      assignees: "singleAssignee",
    });
    expect(link).toBe(
      "https://github.com/testOwner/testRepo/issues/new?title=Test+Title&labels=singleLabel&assignees=singleAssignee"
    );
  });

  it("Correctly handles labels and assignees provided as arrays", () => {
    const link = generateGithubLink("testOwner", "testRepo", {
      title: "Test Title",
      labels: ["label1", "label2", "label3"],
      assignees: ["assignee1", "assignee2", "assignee3"],
    });
    expect(link).toBe(
      "https://github.com/testOwner/testRepo/issues/new?title=Test+Title&labels=label1%2Clabel2%2Clabel3&assignees=assignee1%2Cassignee2%2Cassignee3"
    );
  });

  it("Correctly uses default owner", () => {
    const link = generateGithubLink(undefined, "testRepo", {
      title: "Test Title",
    });
    expect(link).toBe(
      "https://github.com/SiloCityLabs/testRepo/issues/new?title=Test+Title"
    );
  });

  it("Correctly handles an empty repo", () => {
    const link = generateGithubLink("testOwner", "", { title: "Test Title" });
    expect(link).toBe(
      "https://github.com/testOwner//issues/new?title=Test+Title"
    );
  });

  it("Correctly handles an empty array for labels or assignees", () => {
    const link = generateGithubLink("testOwner", "testRepo", {
      title: "Test Title",
      labels: [],
      assignees: [],
    });
    expect(link).toBe(
      "https://github.com/testOwner/testRepo/issues/new?title=Test+Title"
    );
  });
});
