import "mocha";
import * as assert from "assert";
import Example from "../Example";

describe("Example.hello", () => {
    it("should return hello", () => {
        assert.strictEqual(Example.hello(), "hello");
    })
})