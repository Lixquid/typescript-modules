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

export const mathRandomSource: RandomSource = function(
    count: number
): number[] {
    const output = [];
    for (let i = 0; i < count; i++) {
        output.push(Math.random());
    }
    return output;
};

export const cryptoRandomSource: RandomSource = function(
    count: number
): number[] {
    const browserCrypto = crypto ?? msCrypto;
    if (browserCrypto !== undefined) {
        const buffer = new Uint32Array(count);
        browserCrypto.getRandomValues(buffer);
        return Array.prototype.slice.call(buffer.map(x => x / 0x1_0000_0000));
    }

    throw new Error("No crypto source available");
};

export type RandomSource = (count: number) => number[];

export function randomInteger(max: number, source?: RandomSource): number;
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

export function randomFloat(source?: RandomSource): number;
export function randomFloat(max: number, source?: RandomSource): number;
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

export function randomBool(source = mathRandomSource): boolean {
    return randomFloat(source) < 0.5;
}

export function randomString(length: number, source?: RandomSource): string;
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

export function randomArraySlice<T>(src: T[], source?: RandomSource): T[];
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

export function randomArraySample<T>(
    src: T[],
    count: number,
    source = mathRandomSource
): T[] {
    const output = [];
    for (let i = 0; i < count; i++) {
        output.push(src[randomInteger(src.length, source)]);
    }
    return output;
}
