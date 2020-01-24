const formatPlaceholder = /\$\{([^,:}]+?)(?:,([^,:}]*?))?(?::([^}]*?))?\}/g;

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
 * Thrown from {@link format} when an invalid format modified is specified.
 *
 * @export
 * @class InvalidFormatError
 * @extends {Error}
 */
export class InvalidFormatError extends Error {
    public invalidFormat: string;

    constructor(message: string, formatString: string) {
        super(message);
        this.invalidFormat = formatString;
        this.name = "InvalidFormatError";
    }
}

function IntOr(value: string, or: number): number {
    const x = parseInt(value);
    return isNaN(x) ? or : x;
}
function UppercaseIf(
    value: string,
    uppercase: boolean,
    locale: string | undefined
): string {
    return uppercase ? value.toLocaleUpperCase(locale) : value;
}

// TODO: Add all numeric format strings.
const formatValueRegexp = /^([defgnpx])(\d\d?)?$/i;
/**
 * Formats an unknown value according to an optional format string to a string.
 *
 * @export
 * @param {unknown} value The value to format.
 * @param {string} formatString The format string to format.
 * @param {string} [locale] An optional BCP 47 locale string to use when
 * formatting. If no locale is specified, the system default is used.
 * @returns {string} `value` formatted as a string.
 */
export function formatValue(
    value: unknown,
    formatString: string,
    locale?: string
): string {
    switch (typeof value) {
        case "number":
            if (formatString === "") {
                return "" + value;
            }

            const formatExec = formatValueRegexp.exec(formatString);
            if (formatExec === null) {
                throw new InvalidFormatError(
                    `Invalid format string for numeric type: ${formatString}`,
                    formatString
                );
            }

            switch (formatExec[1]) {
                // Non-locale aware decimal
                case "d":
                case "D":
                    return (
                        (value < 0 ? "-" : "") +
                        ("" + Math.abs(value)).padStart(
                            IntOr(formatExec[2], 0),
                            "0"
                        )
                    );

                // Non-locale aware exponential
                case "e":
                case "E":
                    return UppercaseIf(
                        value.toExponential(IntOr(formatExec[2], 6)),
                        formatExec[1] === "E",
                        locale
                    );

                // Fixed-point
                case "f":
                case "F":
                    return value.toLocaleString(locale, {
                        minimumFractionDigits: IntOr(formatExec[2], 2),
                        useGrouping: false
                    });

                // Non-locale aware General
                case "g":
                case "G":
                    return UppercaseIf(
                        value.toPrecision(IntOr(formatExec[2], 15)),
                        formatExec[1] === "G",
                        locale
                    );

                // Numeric
                case "n":
                case "N":
                    return UppercaseIf(
                        value.toLocaleString(locale, {
                            maximumFractionDigits: IntOr(formatExec[2], 2)
                        }),
                        formatExec[1] === "N",
                        locale
                    );

                // Percent
                case "p":
                case "P":
                    return UppercaseIf(
                        value.toLocaleString(locale, {
                            style: "percent",
                            maximumFractionDigits: IntOr(formatExec[2], 2)
                        }),
                        formatExec[1] === "P",
                        locale
                    );

                // Non-locale aware Hexadecimal
                case "x":
                case "X":
                    return (
                        (value < 0 ? "-" : "") +
                        UppercaseIf(
                            Math.abs(value).toString(16),
                            formatExec[1] === "X",
                            locale
                        ).padStart(IntOr(formatExec[2], 0), "0")
                    );
                default:
                    throw new Error(
                        "Unknown numeric format case, should never ever happen"
                    );
            }
        default:
            if (formatString !== "") {
                throw new InvalidFormatError(
                    `Invalid format string for unknown type: ${formatString}`,
                    formatString
                );
            }
            return "" + value;
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
 * `format` specifies a format string to use to format the value. See
 * {@link formatValue} for a list of standard format strings.
 *
 * @export
 * @param {string} input The string with placeholders.
 * @param {{ [key: string]: unknown }} substitutions An object containing keys
 * to substitute.
 * @param {string} [locale] An optional BCP 47 locale string to use when
 * formatting. If no locale is specified, the system default is used.
 * @returns The `input` with placeholders substituted.
 * @throws {FormatKeyMissingError} Thrown when a placeholder contains a key not
 * present in `substitutions`.
 * @throws {InvalidAlignmentError} Thrown when an alignment string is not a
 * valid number.
 * @throws {InvalidFormatError} Thrown when an invalid format string is used
 * for a placeholder.
 */
export function format(
    input: string,
    substitutions: { [key: string]: unknown },
    locale?: string
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
 * @param {(key: string, formatString?: string) => unknown} substitutionFn The
 * function to return the string to be substituted. To use standard formatting
 * strings, pass the result to {@link formatValue} before returning.
 * @returns The `input` with placeholders substituted.
 * @throws {FormatKeyMissingError} Thrown when `substitutionFn` returns
 * `undefined`.
 * @throws {InvalidAlignmentError} Thrown when an alignment string is not a
 * valid number.
 */
export function format(
    input: string,
    substitutionFn: (key: string, formatString?: string) => unknown
): string;

export function format(
    input: string,
    sub:
        | { [key: string]: unknown }
        | ((key: string, formatString?: string) => unknown),
    locale?: string
): string {
    const matchFn =
        typeof sub === "function"
            ? (key: string, formatString?: string): unknown =>
                  sub(key, formatString)
            : (key: string, formatString?: string): unknown => {
                  if (!Object.prototype.hasOwnProperty.call(sub, key)) {
                      throw new FormatKeyMissingError(
                          `Key not found: ${key}`,
                          key
                      );
                  }
                  return formatValue(sub[key], formatString ?? "", locale);
              };
    return input.replace(
        formatPlaceholder,
        (_, key: string, alignmentString?: string, formatString?: string) => {
            const result = matchFn(key, formatString);
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
