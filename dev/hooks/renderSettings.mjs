Hooks.on(`renderSettings`, (app, html) => {
	/** @type {HTMLElement|undefined} */
	const coreUpdateTooltip = html.querySelector(`.build .value a`);
	coreUpdateTooltip?.remove();
});
