Hooks.on(`renderSettings`, (app, html, ctx, options) => {
	/** @type {HTMLElement|undefined} */
	const coreUpdateTooltip = html.querySelector(`.build .value a`);
	coreUpdateTooltip?.remove();
});
