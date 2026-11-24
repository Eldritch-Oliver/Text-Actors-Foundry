import { toPrecision } from "./roundToPrecision.mjs";

/**
 * Formats a numerical value as a weight.
 *
 * @param {number} weight The numerical weight to format
 */
export function formatWeight(weight) {
	const unit = game.settings.get(`taf`, `weightUnit`);
	return toPrecision(weight, 2) + unit;
};
