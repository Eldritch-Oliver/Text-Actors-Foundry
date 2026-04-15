/**
 * Takes a possibly-decimal value and rounds after a certain precision, keeping
 * only the specified amount of decimals.
 *
 * @param {number} value The value that is to be rounded.
 * @param {number} precision The number of decimal places to round to. Must be a
 * positive integer.
 * @returns The rounded number
 */
export function toPrecision(value, precision = 1) {
	if (!Number.isInteger(precision)) {
		throw `Precision must be an integer`;
	};
	if (precision < 0) {
		throw `Precision must be greater than or equal to 0`;
	};

	const m = 10 ** precision;
	return Math.round(value * m) / m;
};
