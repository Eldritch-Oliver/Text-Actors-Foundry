const augmentedProps = new Set([
	`debug`,
	`log`,
	`error`,
	`info`,
	`warn`,
	`group`,
	`time`,
	`timeEnd`,
	`timeLog`,
	`timeStamp`,
]);

/** @type {Console} */
export const Logger = new Proxy(console, {
	get(target, prop, _receiver) {
		if (augmentedProps.has(prop)) {
			return target[prop].bind(target, game.system.id, `|`);
		};
		return target[prop];
	},
});
