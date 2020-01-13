const formatPlaceholder = /\$\{([^,:}]+)\}/g;

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
 * Formats a string with placeholders with substitutions.
 *
 * Placeholders take the form `${key}`.
 *
 * @export
 * @param {string} input The string with placeholders.
 * @param {{ [key: string]: string }} substitutions An object containing keys
 * to substitute.
 * @returns The `input` with placeholders substituted.
 * @throws {FormatKeyMissingError} Thrown when a placeholder contains a key not
 * present in `substitutions`.
 */
export function format(
    input: string,
    substitutions: { [key: string]: any }
): string;
/**
 * Formats a string with placeholders with substitutions.
 *
 * Placeholders take the form `${key}`.
 *
 * @export
 * @param {string} input The string with placeholders.
 * @param {(key: string) => string} substitutionFn The function to return the
 * string to be substituted.
 * @returns The `input` with placeholders substituted.
 */
export function format(
    input: string,
    substitutionFn: (key: string) => string
): string;

export function format(
    input: string,
    sub: { [key: string]: string } | ((key: string) => string)
): string {
    const matchFn =
        typeof sub === "function"
            ? (key: string) => sub(key)
            : (key: string) => (sub.hasOwnProperty(key) ? sub[key] : undefined);
    return input.replace(formatPlaceholder, (_, key: string) => {
        const result = matchFn(key);
        if (result === undefined) {
            throw new FormatKeyMissingError(`Key not found: ${key}`, key);
        }
        return result;
    });
}
