import { PlayerSheet } from "../apps/PlayerSheet.mjs";

/**
 * @typedef SheetSizing
 * @property {number} width The initial width of the application
 * @property {number} height The initial height of the application
 * @property {boolean} resizable Whether or not the application
 * is able to be resized with a drag handle.
 */

/**
 * Retrieves the computed default sizing data based on world settings
 * and the sheet class' DEFAULT_OPTIONS
 * @returns {SheetSizing}
 */
export function getDefaultSizing() {
	/** @type {SheetSizing} */
	const sizing = {
		width: undefined,
		height: undefined,
		resizable: undefined,
	};

	// TODO: defaults from world settings

	// Defaults from the sheet class itself
	sizing.height ||= PlayerSheet.DEFAULT_OPTIONS.position.height;
	sizing.width ||= PlayerSheet.DEFAULT_OPTIONS.position.width;
	sizing.resizable ||= PlayerSheet.DEFAULT_OPTIONS.window.resizable;

	return sizing;
};
