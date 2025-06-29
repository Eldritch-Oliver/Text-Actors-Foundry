import { __ID__, filePath } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";
import { toID } from "../utils/toID.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { deepClone, diffObject, randomID, setProperty } = foundry.utils;

export class AttributeManager extends HandlebarsApplicationMixin(ApplicationV2) {

	// #region Options
	static DEFAULT_OPTIONS = {
		tag: `form`,
		classes: [
			__ID__,
			`AttributeManager`,
		],
		position: {
			width: 400,
			height: 350,
		},
		window: {
			resizable: true,
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: true,
			handler: this.#onSubmit,
		},
		actions: {
			addNew: this.#addNew,
			removeAttribute: this.#remove,
		},
	};

	static PARTS = {
		attributes: {
			template: filePath(`templates/AttributeManager/attribute-list.hbs`),
		},
		controls: {
			template: filePath(`templates/AttributeManager/controls.hbs`),
		},
	};
	// #endregion Options

	// #region Instance Data
	/** @type {string | null} */
	#doc = null;

	#attributes;

	constructor({ document , ...options } = {}) {
		super(options);
		this.#doc = document;
		this.#attributes = deepClone(document.system.attr);
	};

	get title() {
		return `Attributes: ${this.#doc.name}`;
	};
	// #endregion Instance Data

	// #region Lifecycle
	async _onRender(context, options) {
		await super._onRender(context, options);

		const elements = this.element
			.querySelectorAll(`[data-bind]`);
		for (const input of elements) {
			input.addEventListener(`change`, this.#bindListener.bind(this));
		};
	};
	// #endregion Lifecycle

	// #region Data Prep
	async _preparePartContext(partId) {
		const ctx = {};

		ctx.actor = this.#doc;

		switch (partId) {
			case `attributes`: {
				await this._prepareAttributeContext(ctx);
			};
		};

		return ctx;
	};

	async _prepareAttributeContext(ctx) {
		const attrs = [];
		for (const [id, data] of Object.entries(this.#attributes)) {
			if (data == null) { continue };
			attrs.push({
				id,
				name: data.name,
				isRange: data.isRange,
				isNew: data.isNew ?? false,
			});
		};
		ctx.attrs = attrs;
	};
	// #endregion Data Prep

	// #region Actions
	/**
	 * @param {Event} event
	 */
	async #bindListener(event) {
		const target = event.target;
		const data = target.dataset;
		const binding = data.bind;

		let value = target.value;
		switch (target.type) {
			case `checkbox`: {
				value = target.checked;
			};
		};

		Logger.debug(`Updating ${binding} value to ${value}`);
		setProperty(this.#attributes, binding, value);
		await this.render();
	};

	/** @this {AttributeManager} */
	static async #addNew() {
		const id = randomID();
		this.#attributes[id] = {
			name: ``,
			isRange: false,
			isNew: true,
		};
		await this.render({ parts: [ `attributes` ]});
	};

	/** @this {AttributeManager} */
	static async #remove($e, element) {
		const attribute = element.closest(`[data-attribute]`)?.dataset.attribute;
		if (!attribute) { return };
		delete this.#attributes[attribute];
		this.#attributes[`-=${attribute}`] = null;
		await this.render({ parts: [ `attributes` ] });
	};

	/** @this {AttributeManager} */
	static async #onSubmit() {
		const entries = Object.entries(this.#attributes)
			.map(([id, attr]) => {
				if (attr == null) {
					return [ id, attr ];
				};

				if (attr.isNew) {
					delete attr.isNew;
					return [ toID(attr.name), attr ];
				};

				return [ id, attr ];
			});
		const data = Object.fromEntries(entries);

		const diff = diffObject(
			this.#doc.system.attr,
			data,
			{ inner: false, deletionKeys: true },
		);

		await this.#doc.update({ "system.attr": diff });
	};
	// #endregion Actions
};
