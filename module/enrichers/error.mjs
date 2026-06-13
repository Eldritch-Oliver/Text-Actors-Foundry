import { TafIcon } from "../apps/elements/Icon.mjs";

/**
 * Creates an enricher error that users can hover over to find information about
 * why the enrichment failed.
 *
 * @param {string} message The message to put in the enricher
 */
export function createEnricherError(message) {
	const icon = new TafIcon();
	icon.setAttribute(`name`, `icons/error`);
	icon.setAttribute(`data-tooltip`, message);
	return icon;
};
