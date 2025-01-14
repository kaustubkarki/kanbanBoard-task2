import { generateId } from "../utils/utils";

describe("generateId", () => {
  it("should generate a number between 0 and 10000", () => {
    const id = generateId();
    expect(id).toBeGreaterThanOrEqual(0);
    expect(id).toBeLessThanOrEqual(10000);
  });

  it("should generate a random number", () => {
    const id1 = generateId();
    const id2 = generateId();
    expect(id1).not.toEqual(id2); // It's possible this could fail occasionally due to randomness
  });
});
