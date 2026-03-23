import { __ID__ } from "../consts.mjs";
import { toPrecision } from "./roundToPrecision.mjs";

/**
 * Formats a numerical value as a weight.
 *
 * @param {number} weight The numerical weight to format
 */
export function formatWeight(weight) {
	const unit = game.settings.get(__ID__, `weightUnit`);
	return toPrecision(weight, 2) + unit;
};
