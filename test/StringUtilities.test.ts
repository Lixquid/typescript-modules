import { format } from "../src/StringUtilities";
describe("format", () => {
    describe("object substitution", () => {
        it("should substitute placeholders when given an object with keys", () => {
            expect(format("Hello ${name}!", { name: "Alice" })).toBe(
                "Hello Alice!"
            );
            expect(
                format("Output ${first} ${second} ${first}", {
                    first: 1,
                    second: 2
                })
            ).toBe("Output 1 2 1");
        });
        it("should throw a FormatKeyMissingError when asked to substitute a key not in the input object", () => {
            expect(() => format("Hello ${unknown}.", { a: "a" })).toThrowError(
                /key not found.*unknown/i
            );
            expect(() => format("Hello ${toString}.", { a: "a" })).toThrowError(
                /key not found.*toString/i
            );
        });
    });
    describe("function substitution", () => {
        const fn = jest.fn(() => "hello");
        beforeEach(() => fn.mockClear());

        it("should substitute placeholders when given a substitution function", () => {
            expect(format("Hello ${key}!", fn)).toBe("Hello hello!");
            expect(fn).toHaveBeenCalledWith("key");
        });
    });
});
