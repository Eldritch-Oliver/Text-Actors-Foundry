/**
 * A helper method that converts an arbitrary string into a format that can be
 * used as an object key easily.
 *
 * @param {string} text The text to convert
 * @returns The converted ID
 */
export function toID(text) {
	return text
		.toLowerCase()
		.replace(/\s+/g, `_`)
		.replace(/\W/g, ``);
};
