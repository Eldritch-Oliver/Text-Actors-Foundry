/**
 * A helper method that converts an arbitrary string into a format
 * that can be used as an object key easily.
 *
 * @param {string} text The text to convert
 * @returns The converted ID
 */
export function toID(text) {
	return text
		.toLowerCase()
		.replace(/\s+/g, `_`)
		.replace(/\W/g, ``)
		.replace(/(^_|_$)/);
};

/**
 * A helper method that reports if an arbitrary string is considered a
 * valid ID for use in the system
 *
 * @param {string} text The text to check
 * @returns Whether or not the text is a valid ID
 */
export function isValidID(text) {
	return !(
		// any uppercase characters
		text.match(/[A-Z]/)

		// any non-word characters
		|| text.match(/\W/)

		// any whitespace characters
		|| text.match(/\s/)
	);
};
