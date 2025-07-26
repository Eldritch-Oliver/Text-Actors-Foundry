/**
 * @typedef {object} Option
 * @property {string} [label]
 * @property {string|number} value
 * @property {boolean} [disabled]
 */

/**
 * @param {string | number} selected The selected value
 * @param {Array<Option | string>} opts The options that are valid
 * @param {any} meta The Handlebars meta processing
 */
export function options(selected, opts, meta) {
	const { localize = false } = meta.hash;
	selected = Handlebars.escapeExpression(selected);
	const htmlOptions = [];

	for (let opt of opts) {
		if (typeof opt === `string`) {
			opt = { label: opt, value: opt };
		};
		opt.value = Handlebars.escapeExpression(opt.value);
		htmlOptions.push(
			`<option
				value="${opt.value}"
				${selected === opt.value ? `selected` : ``}
				${opt.disabled ? `disabled` : ``}
			>
				${localize ? game.i18n.format(opt.label) : opt.label}
			</option>`,
		);
	};
	return new Handlebars.SafeString(htmlOptions.join(`\n`));
};
