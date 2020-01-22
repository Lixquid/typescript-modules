interface BrowserCrypto {
    /**
     * @see https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
     */
    getRandomValues: (
        typedArray:
            | Int8Array
            | Int16Array
            | Int32Array
            | Uint8Array
            | Uint16Array
            | Uint32Array
    ) => void;
}

declare global {
    const crypto: BrowserCrypto | undefined;
    const msCrypto: BrowserCrypto | undefined;
}

/**
 * Thrown from {@link cryptoRandomSource} when no source of cryptographically
 * strong random numbers are available.
 *
 * @export
 * @class NoCryptoSourceAvailableError
 * @extends {Error}
 */
export class NoCryptoSourceAvailableError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "NoCryptoSourceAvailableError";
    }
}

/**
 * A {@link RandomSource} using `Math.random`.
 *
 * @export
 * @extends RandomSource
 */
export const mathRandomSource: RandomSource = function(
    count: number
): number[] {
    const output = [];
    for (let i = 0; i < count; i++) {
        output.push(Math.random());
    }
    return output;
};

/**
 * A {@link RandomSource} using whatever cryptographically secure sources are
 * available. Use {@link cryptoRandomSourceAvailable} to check if crypto is
 * available in the environment if unsure beforehand.
 *
 * @export
 * @extends RandomSource
 * @throws {NoCryptoSourceAvailableError} Thrown when no source of
 * cryptographically strong random numbers are available.
 * @see cryptoRandomSourceAvailable
 */
export const cryptoRandomSource: RandomSource = function(
    count: number
): number[] {
    const browserCrypto = crypto ?? msCrypto;
    if (browserCrypto !== undefined) {
        const buffer = new Uint32Array(count);
        browserCrypto.getRandomValues(buffer);
        return Array.prototype.slice.call(buffer.map(x => x / 0x1_0000_0000));
    }

    throw new NoCryptoSourceAvailableError("No crypto source available");
};

/**
 * Returns if {@link cryptoRandomSource} can be used.
 *
 * @export
 * @returns If `false`, `cryptoRandomSource` will throw a
 * `NoCryptoSourceAvailableError` when invoked.
 * @see cryptoRandomSource
 */
export function cryptoRandomSourceAvailable(): boolean {
    return (crypto ?? msCrypto) != null;
}

/**
 * A suitable source of random numbers.
 *
 * @export
 * @param {number} count The number of random floats to generate.
 * @returns {number[]} The generated floats. These floats should be between 0
 * (inclusive) and 1 (exclusive).
 */
export type RandomSource = (count: number) => number[];

/**
 * Returns a random integer between 0 (inclusive) and `max` (exclusive).
 *
 * @export
 * @param {number} max The exclusive maximum to generate.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {number} A random integer between 0 (inclusive) and `max`
 * (exclusive).
 */
export function randomInteger(max: number, source?: RandomSource): number;
/**
 * Returns a random integer between `min` (inclusive) and `max` (exclusive). If
 * `max` is less than `min`, `max` and `min` are swapped.
 *
 * @export
 * @param {number} min The inclusive minimum to generate.
 * @param {number} max The exclusive maximum to generate.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {number} A random integer between `min` (inclusive) and `max`
 * (exclusive).
 */
export function randomInteger(
    min: number,
    max: number,
    source?: RandomSource
): number;

export function randomInteger(
    minMax: number,
    maxSource?: number | RandomSource,
    source?: RandomSource
): number {
    return Math.floor(
        randomFloat(minMax as any, maxSource as any, source as any)
    );
}

/**
 * Returns a random float between 0 (inclusive) and 1 (exclusive).
 *
 * @export
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {number} A random integer between 0 (inclusive) and 1 (exclusive).
 */
export function randomFloat(source?: RandomSource): number;
/**
 * Returns a random float between 0 (inclusive) and `max` (exclusive). If
 * `max` is less than 0, `max` becomes the inclusive minimum, and 0 is the
 * exclusive maximum.
 *
 * @export
 * @param {number} max The exclusive maximum to generate.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {number} A random float between 0 (inclusive) and `max`
 * (exclusive).
 */
export function randomFloat(max: number, source?: RandomSource): number;
/**
 * Returns a random float between `min` (inclusive) and `max` (exclusive). If
 * `max` is less than `min`, `max` and `min` are swapped.
 *
 * @export
 * @param {number} min The inclusive minimum to generate.
 * @param {number} max The exclusive maximum to generate.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {number} A random float between `min` (inclusive) and `max`
 * (exclusive).
 */
export function randomFloat(
    min: number,
    max: number,
    source?: RandomSource
): number;

export function randomFloat(
    minMaxSource?: number | RandomSource,
    maxSource?: number | RandomSource,
    source?: RandomSource
): number {
    // Argument Casting
    let min = 0,
        max = 1;

    if (typeof maxSource === "number") {
        min = minMaxSource as number;
        max = maxSource;
        source = source ?? mathRandomSource;
    } else if (typeof minMaxSource === "number") {
        max = minMaxSource;
        source = maxSource ?? mathRandomSource;
    } else {
        source = minMaxSource ?? mathRandomSource;
    }

    // Swap the arguments for convenience sake
    if (max < min) {
        [max, min] = [min, max];
    }

    // Calculate random value
    return source(1)[0] * (max - min) + min;
}

/**
 * Returns a random boolean.
 *
 * @export
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {boolean} A random boolean.
 */
export function randomBool(source: RandomSource = mathRandomSource): boolean {
    return randomFloat(source) < 0.5;
}

/**
 * Returns a random string of alphabetic characters of the specified length.
 *
 * @export
 * @param {number} length The length of string to generate.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {string} A string of length `length` composed of random alphabetic
 * characters.
 */
export function randomString(length: number, source?: RandomSource): string;
/**
 * Returns a random string of characters of the specified length, sampled from
 * the specified input set.
 *
 * @export
 * @param {number} length The length of string to generate.
 * @param {string} src The string of characters to sample from for the new
 * string. Characters that occur multiple times are more likely to appear in
 * the output string.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {string} A string of length `length` composed of random characters
 * sampled from `src`.
 */
export function randomString(
    length: number,
    src: string,
    source?: RandomSource
): string;

export function randomString(
    length: number,
    srcSource?: string | RandomSource,
    source?: RandomSource
): string {
    // Argument Casting
    let src = "abcdefghijklmnopqrstuvwxyz";

    if (typeof srcSource === "string") {
        src = srcSource;
        source = source ?? mathRandomSource;
    } else {
        source = srcSource ?? mathRandomSource;
    }

    // Calculate random value
    const randomIndexes = source(length).map(x => Math.floor(x * src.length));

    let output = "";
    for (let i = 0; i < length; i++) {
        output += src[randomIndexes[i]];
    }
    return output;
}

/**
 * Returns a copy of `src` with the contents shuffled.
 *
 * @export
 * @template T The type of the array.
 * @param {T[]} src The array to return a copy from.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {T[]} A new array which is a copy of `src` with the contents
 * shuffled.
 */
export function randomArraySlice<T>(src: T[], source?: RandomSource): T[];
/**
 * Returns a new array of length `length` which is a shuffled slice of `src`.
 *
 * @export
 * @template T The type of the array.
 * @param {T[]} src The array to return a copy from.
 * @param {number} length The length of array to return.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {T[]} A new array of length `length` which is a shuffled slice of
 * `src`.
 */
export function randomArraySlice<T>(
    src: T[],
    length: number,
    source?: RandomSource
): T[];

export function randomArraySlice<T>(
    src: T[],
    lengthSource?: number | RandomSource,
    source?: RandomSource
): T[] {
    // Argument Casting
    let length = src.length;
    if (typeof lengthSource === "number") {
        length = lengthSource;
        source = source ?? mathRandomSource;
    } else {
        source = lengthSource ?? mathRandomSource;
    }

    // Special case 1
    if (length === 1) {
        return [src[randomInteger(src.length, source)]];
    }

    // Shuffle src
    const output = src.slice(),
        randomValues = source(src.length);

    for (let i = output.length; i > 0; i--) {
        const j = Math.floor(randomValues[i] * (i + 1));
        [output[i], output[j]] = [output[j], output[i]];
    }

    return output.slice(0, length);
}

/**
 * Returns a new array of length `count` which is a random sampling of `src`.
 * (Non-unique random picking.)
 *
 * @export
 * @template T The type of the array.
 * @param {T[]} src The array to sample from. elements that appear multiple
 * times have a linearly increased chance to be picked.
 * @param {number} count The length of array to return.
 * @param {RandomSource} [source] The source of random numbers to use. If
 * omitted, {@link mathRandomSource} will be used.
 * @returns {T[]} A new array of length `count` with contents sampled from
 * `src`.
 */
export function randomArraySample<T>(
    src: T[],
    count: number,
    source: RandomSource = mathRandomSource
): T[] {
    const output = [];
    for (let i = 0; i < count; i++) {
        output.push(src[randomInteger(src.length, source)]);
    }
    return output;
}
