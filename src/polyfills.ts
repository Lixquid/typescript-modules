// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padStart
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the start (left) of the current string.
 *
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
export function stringPadStart(
    this: string,
    maxLength: number,
    fillString?: string
): string {
    maxLength = maxLength >> 0; //truncate if number, or convert non-number to 0;
    fillString = String(fillString !== undefined ? fillString : " ");
    if (this.length >= maxLength) {
        return String(this);
    } else {
        maxLength = maxLength - this.length;
        if (maxLength > fillString.length) {
            fillString += fillString.repeat(maxLength / fillString.length); //append to original to ensure we are longer than needed
        }
        return fillString.slice(0, maxLength) + String(this);
    }
}
if (!String.prototype.padStart) {
    String.prototype.padStart = stringPadStart;
}

// https://github.com/uxitten/polyfill/blob/master/string.polyfill.js
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/padEnd
/**
 * Pads the current string with a given string (possibly repeated) so that the resulting string reaches a given length.
 * The padding is applied from the end (right) of the current string.
 *
 * @param maxLength The length of the resulting string once the current string has been padded.
 *        If this parameter is smaller than the current string's length, the current string will be returned as it is.
 *
 * @param fillString The string to pad the current string with.
 *        If this string is too long, it will be truncated and the left-most part will be applied.
 *        The default value for this parameter is " " (U+0020).
 */
function stringPadEnd(
    this: string,
    maxLength: number,
    fillString?: string
): string {
    maxLength = maxLength >> 0; //floor if number or convert non-number to 0;
    fillString = String(typeof fillString !== "undefined" ? fillString : " ");
    if (this.length > maxLength) {
        return String(this);
    } else {
        maxLength = maxLength - this.length;
        if (maxLength > fillString.length) {
            fillString += fillString.repeat(maxLength / fillString.length); //append to original to ensure we are longer than needed
        }
        return String(this) + fillString.slice(0, maxLength);
    }
}
if (!String.prototype.padEnd) {
    String.prototype.padEnd = stringPadEnd;
}
