import { __ID__, filePath } from "../consts.mjs";
import { attributeSorter } from "../utils/attributeSort.mjs";
import { ask } from "../utils/DialogManager.mjs";
import { localizer } from "../utils/localizer.mjs";
import { toID } from "../utils/toID.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { deepClone, diffObject, mergeObject, performIntegerSort, randomID, setProperty } = foundry.utils;
const { DragDrop } = foundry.applications.ux;

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
			height: `auto`,
		},
		window: {
			resizable: true,
			controls: [
				{
					icon: `fa-solid fa-globe`,
					label: `Save As Defaults`,
					visible: () => game.user.isGM,
					action: `saveAsDefault`,
				}
			],
		},
		form: {
			submitOnChange: false,
			closeOnSubmit: true,
			handler: this.#onSubmit,
		},
		actions: {
			addNew: this.#addNew,
			removeAttribute: this.#remove,
			saveAsDefault: this.#saveAsDefaults,
		},
	};

	static PARTS = {
		attributes: { template: filePath(`templates/AttributeManager/attribute-list.hbs`) },
		controls: { template: filePath(`templates/AttributeManager/controls.hbs`) },
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
		return localizer(
			`taf.Apps.AttributeManager.title`,
			this.#doc,
		);
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

		new DragDrop.implementation({
			dragSelector: `.attribute-drag-handle`,
			dropSelector: `.attributes`,
			callbacks: {
				dragstart: this._onDragStart.bind(this),
				drop: this._onDrop.bind(this),
			},
		}).bind(this.element);
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
		this.#attributes = data;

		const diff = diffObject(
			this.#doc.system.attr,
			data,
			{ inner: false, deletionKeys: true },
		);

		await this.#doc.update({ "system.attr": diff });
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
			if (game.release.generation >= 14 && data == _del) continue;
			attrs.push({
				id,
				name: data.name,
				sort: data.sort,
				isRange: data.isRange,
				isNew: data.isNew ?? false,
			});
		};
		ctx.attrs = attrs.sort(attributeSorter);
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

		setProperty(this.#attributes, binding, value);
		await this.render({ parts: [ `attributes` ]});
	};

	/** @this {AttributeManager} */
	static async #addNew() {
		const id = randomID();
		this.#attributes[id] = {
			name: ``,
			sort: Number.MAX_SAFE_INTEGER,
			isRange: false,
			isNew: true,
		};
		await this.render({ parts: [ `attributes` ]});
	};

	/** @this {AttributeManager} */
	static async #remove($e, element) {
		const attribute = element.closest(`[data-attribute]`)?.dataset.attribute;
		if (!attribute) { return };
		if (game.release.generation < 14) {
			delete this.#attributes[attribute];
			this.#attributes[`-=${attribute}`] = null;
		}
		else {
			this.#attributes[attribute] = _del;
		}
		await this.render({ parts: [ `attributes` ] });
	};

	/** @this {AttributeManager} */
	static async #saveAsDefaults() {
		const attrs = deepClone(this.#attributes);

		// Prompt the user for what values they want to save the attributes with
		const inputs = [];
		for (const attr of Object.values(attrs)) {
			const id = toID(attr.name);

			if (attr.isRange) {
				inputs.push(
					{
						type: `collapse`,
						summary: attr.name,
						inputs: [
							{
								key: `${id}.value`,
								type: `input`,
								inputType: `number`,
								label: `Value`,
								defaultValue: attr.value,
							},
							{
								key: `${id}.max`,
								type: `input`,
								inputType: `number`,
								label: `Maximum`,
								defaultValue: attr.max,
							},
						],
					},
					{ type: `divider` }
				);
				continue;
			};

			inputs.push({
				key: `${id}.value`,
				type: `input`,
				inputType: `number`,
				label: `${attr.name}`,
				defaultValue: attr.value,
			});

			inputs.push({ type: `divider` });
		};

		const prompt = {
			id: `${this.#doc.id}-global-attr-saving`,
			inputs: inputs.slice(0, -1),
			alwaysUseAnswerObject: true,
			window: { title: `taf.Apps.AttributeManager.default-attribute-values` },
		};

		const response = await ask(prompt);
		switch (response.state) {
			case `errored`:
				ui.notifications.error(response.error);
			case `fronted`:
				return;
		};

		if (!response.answers) { return };

		const fullAttrs = mergeObject(attrs, response.answers);
		game.settings.set(__ID__, `actorDefaultAttributes`, fullAttrs);
		ui.notifications.success(`taf.notifs.success.saved-default-attributes`);
	};
	// #endregion Actions

	// #region Drag & Drop
	_onDragStart(event) {
		const target = event.currentTarget.closest(`[data-attribute]`);
		if (`link` in event.target.dataset) { return };
		if (!target.dataset.attribute) { return };

		const attributeID = target.dataset.attribute;
		const attribute = this.#attributes[attributeID];
		const dragData = {
			_id: attributeID,
			sort: attribute.sort,
		};

		event.dataTransfer.setDragImage(target, 16, 23);
		event.dataTransfer.setData(`taf/json`, JSON.stringify(dragData));

		// Provide an attribute reference in a way that prose-mirror can use
		if (!attribute.isNew) {
			event.dataTransfer.setData(
				`text/plain`,
				`[[@${attributeID}]]{${attribute.name}}`,
			);
		};
	};

	_onDrop(event) {
		let dropped;
		try {
			dropped = JSON.parse(event.dataTransfer.getData(`taf/json`));
		} catch {
			return;
		}

		const dropTarget = event.target.closest(`[data-attribute]`);
		if (!dropTarget) { return };
		const targetID = dropTarget.dataset.attribute;
		let target;

		// Not moving location, ignore drop event
		if (targetID === dropped._id) { return };

		// Determine all of the siblings and create sort data
		const siblings = [];
		for (const element of dropTarget.parentElement.children) {
			const siblingID = element.dataset.attribute;
			const attr = this.#attributes[siblingID];
			const sibling = {
				_id: siblingID,
				sort: attr.sort,
			};
			if (siblingID && siblingID !== dropped._id) {
				siblings.push(sibling);
			};
			if (siblingID === targetID) {
				target = sibling;
			}
		};

		const sortUpdates = performIntegerSort(
			dropped,
			{
				target,
				siblings,
			},
		);

		const updateEntries = sortUpdates.map(({ target, update }) => {
			return [ `${target._id}.sort`, update.sort ];
		});
		const update = Object.fromEntries(updateEntries);

		mergeObject(
			this.#attributes,
			update,
			{
				insertKeys: false,
				insertValues: false,
				inplace: true,
				performDeletions: false,
			},
		);

		this.render({ parts: [ `attributes` ] });
	};
	// #endregion Drag & Drop
};
