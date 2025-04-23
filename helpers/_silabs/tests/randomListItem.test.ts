import { randomListItem } from "@/helpers/_silabs/randomListItem";

describe("randomListItem", () => {
  it("should return a value from the object", () => {
    const obj = { a: 1, b: 2, c: 3 };
    const result = randomListItem(obj);
    expect(Object.values(obj)).toContain(result);
  });
});
