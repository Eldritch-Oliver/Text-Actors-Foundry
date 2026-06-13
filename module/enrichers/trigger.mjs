/**
 * A unique ID to assign to the enricher type. Required if you want to use the onRender callback.
 * @type {string}
 */
export const id = `itemTrigger`;

/**
 * The string pattern to match. Must be flagged as global.
 * @type {RegExp}
 */
export const pattern = /\[\[trigger (?<id>[a-zA-Z0-9\.]+)\]\]/g;

/**
 * The function that will be called on each match. It is expected that this
 * returns an HTML element to be inserted into the final enriched content.
 * @type {import("@client/config.mjs").TextEditorEnricher}
 */
export function enricher(match, options) {
	console.log({ match, options });
	const { id } = match.groups ?? {};

	const item = fromUuidSync(id)

	const el = document.createElement(`button`);
	el.innerHTML = _loc(`taf.enrichers.${id}.button-label`, { name:  });
	el.setAttribute(`data-item-uuid`, id);
	return el;
};

/**
 * An optional callback that is invoked when the enriched content is added to the DOM.
 * @type {Function(HTMLEnrichedContentElement)}
 */
export function onRender(content) {
	content.addEventListener(`click`, () => {
		console.log(`Hello!`);
	})
};
