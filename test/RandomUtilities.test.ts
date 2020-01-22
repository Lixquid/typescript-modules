import {
    randomArraySample,
    randomArraySlice,
    randomBool,
    randomFloat,
    randomInteger,
    randomString
} from "../src/RandomUtilities";

function repeat(fn: Function): () => void {
    return () => {
        for (let i = 0; i < 300; i++) {
            fn();
        }
    };
}

const mockRandomSource = jest.fn((count: number) =>
    Array.apply(null, { length: count } as any).map((_: unknown) => 0.5)
);

beforeEach(() => mockRandomSource.mockClear());

describe("randomInteger", () => {
    it(
        "should return an integer between 0 and max when given one argument",
        repeat(() => {
            const x = randomInteger(10);
            expect(x).toBeGreaterThanOrEqual(0);
            expect(x).toBeLessThan(10);
            expect(Number.isInteger(x)).toBeTruthy();
        })
    );
    it(
        "should return an integer between min and max when given two arguments",
        repeat(() => {
            const x = randomInteger(-10, 10);
            expect(x).toBeGreaterThanOrEqual(-10);
            expect(x).toBeLessThan(10);
            expect(Number.isInteger(x)).toBeTruthy();
        })
    );
    it(
        "should flip the arguments when given a min greater than max",
        repeat(() => {
            const x = randomInteger(10, -10);
            expect(x).toBeGreaterThanOrEqual(-10);
            expect(x).toBeLessThan(10);
            expect(Number.isInteger(x)).toBeTruthy();
        })
    );
    it("should accept a RandomSource", () => {
        const x = randomInteger(0, 10, mockRandomSource);
        repeat(() => expect(x).toBe(randomInteger(0, 10, mockRandomSource)))();
    });
});

describe("randomFloat", () => {
    it(
        "should return a float between 0 and 1 when given no arguments",
        repeat(() => {
            const x = randomFloat();
            expect(x).toBeGreaterThanOrEqual(0);
            expect(x).toBeLessThan(1);
        })
    );
    it(
        "should return a float between 0 and max when given one argument",
        repeat(() => {
            const x = randomFloat(10);
            expect(x).toBeGreaterThanOrEqual(0);
            expect(x).toBeLessThan(10);
        })
    );
    it(
        "should return a float between min and max when given two arguments",
        repeat(() => {
            const x = randomFloat(-10, 10);
            expect(x).toBeGreaterThanOrEqual(-10);
            expect(x).toBeLessThan(10);
        })
    );
    it(
        "should flip the arguments when given a min greater than max",
        repeat(() => {
            const x = randomFloat(10, -10);
            expect(x).toBeGreaterThanOrEqual(-10);
            expect(x).toBeLessThan(10);
        })
    );
    it("should accept a RandomSource", () => {
        const x = randomFloat(0, 10, mockRandomSource);
        repeat(() => expect(x).toBe(randomFloat(0, 10, mockRandomSource)))();
    });
});

describe("randomBool", () => {
    it(
        "should return a random boolean when called",
        repeat(() => {
            expect(typeof randomBool()).toBe("boolean");
        })
    );
    it("should accept a RandomSource", () => {
        const x = randomBool(mockRandomSource);
        repeat(() => expect(x).toBe(randomBool(mockRandomSource)))();
    });
});

describe("randomString", () => {
    it(
        "should return a random string of alphabetic characters when given one argument",
        repeat(() => {
            const x = randomString(10);
            expect(typeof x).toBe("string");
            expect(x).toMatch(/^[a-z]+$/);
        })
    );
    it(
        "should return a random string of characters from a source when given two arguments",
        repeat(() => {
            const x = randomString(10, "aZ.");
            expect(typeof x).toBe("string");
            expect(x).toMatch(/^[aZ.]+$/);
        })
    );
    it("should accept a RandomSource", () => {
        const x = randomString(10, mockRandomSource);
        repeat(() => expect(x).toBe(randomString(10, mockRandomSource)))();
    });
});

describe("randomArraySlice", () => {
    it(
        "should return a shuffled copy of the array when given one argument",
        repeat(() => {
            const x = randomArraySlice([1, 2, 3]);
            expect(x.sort()).toEqual([1, 2, 3]);
        })
    );
    it(
        "should return a shuffled slice of the array when given two arguments",
        repeat(() => {
            const x = randomArraySlice([1, 2, 3, 4], 2);
            expect(x).toHaveLength(2);
            expect([1, 2, 3, 4]).toEqual(expect.arrayContaining(x));
        })
    );
    it("should accept a RandomSource", () => {
        const x = randomArraySlice([1, 2, 3], mockRandomSource);
        repeat(() =>
            expect(x).toEqual(randomArraySlice([1, 2, 3], mockRandomSource))
        )();
    });
});

describe("randomArraySample", () => {
    it(
        "should return a sample of the array when called",
        repeat(() => {
            const x = randomArraySample([1, 2, 3], 10);
            expect(x).toHaveLength(10);
            const ex = expect([1, 2, 3]);
            x.forEach(i => ex.toContain(i));
        })
    );
    it("should accept a RandomSource", () => {
        const x = randomArraySample([1, 2, 3], 10, mockRandomSource);
        repeat(() =>
            expect(x).toEqual(
                randomArraySample([1, 2, 3], 10, mockRandomSource)
            )
        )();
    });
});
