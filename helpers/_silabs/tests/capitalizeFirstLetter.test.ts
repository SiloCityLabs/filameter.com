import { capitalizeFirstLetter } from "@/helpers/_silabs/capitalizeFirstLetter";

describe("capitalizeFirstLetter", () => {
  it("should return an empty string for an empty string input", () => {
    expect(capitalizeFirstLetter("")).toBe("");
  });

  it('should capitalize a string with multiple words separated by "-"', () => {
    expect(capitalizeFirstLetter("hello-world-example")).toBe(
      "Hello World Example"
    );
  });

  it('should capitalize a string with multiple words separated by ","', () => {
    expect(capitalizeFirstLetter("hello,world,example", ",")).toBe(
      "Hello World Example"
    );
  });

  it("should capitalize a single word string", () => {
    expect(capitalizeFirstLetter("hello")).toBe("Hello");
  });

  it("should return an empty string for null input", () => {
    expect(capitalizeFirstLetter(null as any)).toBe("");
  });

  it("should return an empty string for undefined input", () => {
    expect(capitalizeFirstLetter(undefined as any)).toBe("");
  });
});
