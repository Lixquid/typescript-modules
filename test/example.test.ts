import { hello } from "../src/example";

describe("hello", () => {
    it("should say hello", () => {
        expect(hello("Alice")).toBe("Hello Alice!");
    });
});
