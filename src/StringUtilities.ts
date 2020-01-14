const formatPlaceholder = /\$\{([^,:}]+?)(?:,([^,:}]*?))?\}/g;

/**
 * Thrown from {@link format} when a key is not found in a substitution object.
 *
 * @export
 * @class FormatKeyMissingError
 * @extends {Error}
 */
export class FormatKeyMissingError extends Error {
    public missingKey: string;

    constructor(message: string, key: string) {
        super(message);
        this.missingKey = key;
        this.name = "FormatKeyMissingError";
    }
}

/**
 * Thrown from {@link format} when an invalid alignment is specified.
 *
 * @exports
 * @class InvalidAlignmentError
 * @extends {Error}
 */
export class InvalidAlignmentError extends Error {
    public invalidAlignment: string;

    constructor(message: string, alignmentString: string) {
        super(message);
        this.invalidAlignment = alignmentString;
        this.name = "InvalidAlignmentError";
    }
}

/**
 * Formats a string with placeholders with substitutions.
 *
 * Placeholders take the form `${key(,alignment)(:format)}`, with `alignment`
 * and `format` being optional.
 *
 * `alignment` specifies a minimum width for the placeholder, with smaller
 * strings being padded with the U+0020 space character. A positive alignment
 * number will pad the beginning, and a negative alignment number will pad the
 * end.
 *
 * @export
 * @param {string} input The string with placeholders.
 * @param {{ [key: string]: unknown }} substitutions An object containing keys
 * to substitute.
 * @returns The `input` with placeholders substituted.
 * @throws {FormatKeyMissingError} Thrown when a placeholder contains a key not
 * present in `substitutions`.
 * @throws {InvalidAlignmentError} Thrown when an alignment string is not a
 * valid number.
 */
export function format(
    input: string,
    substitutions: { [key: string]: unknown }
): string;
/**
 * Formats a string with placeholders with substitutions.
 *
 * Placeholders take the form `${key(,alignment)(:format)}`, with `alignment`
 * and `format` being optional.
 *
 * `alignment` specifies a minimum width for the placeholder, with smaller
 * strings being padded with the U+0020 space character. A positive alignment
 * number will pad the beginning, and a negative alignment number will pad the
 * end.
 *
 * @export
 * @param {string} input The string with placeholders.
 * @param {(key: string) => unknown} substitutionFn The function to return the
 * string to be substituted.
 * @returns The `input` with placeholders substituted.
 * @throws {FormatKeyMissingError} Thrown when `substitutionFn` returns
 * `undefined`.
 * @throws {InvalidAlignmentError} Thrown when an alignment string is not a
 * valid number.
 */
export function format(
    input: string,
    substitutionFn: (key: string) => unknown
): string;

export function format(
    input: string,
    sub: { [key: string]: unknown } | ((key: string) => unknown)
): string {
    const matchFn =
        typeof sub === "function"
            ? (key: string) => sub(key)
            : (key: string) => {
                  if (!sub.hasOwnProperty(key)) {
                      throw new FormatKeyMissingError(
                          `Key not found: ${key}`,
                          key
                      );
                  }
                  return sub[key];
              };
    return input.replace(
        formatPlaceholder,
        (_, key: string, alignmentString?: string) => {
            const result = matchFn(key);
            let output = "" + result;
            if (alignmentString) {
                const alignment = parseInt(alignmentString);
                if (isNaN(alignment)) {
                    throw new InvalidAlignmentError(
                        `Invalid alignment: ${alignmentString}`,
                        alignmentString
                    );
                }

                if (alignment < 0) {
                    output = output.padEnd(-alignment);
                } else {
                    output = output.padStart(alignment);
                }
            }
            return output;
        }
    );
}
