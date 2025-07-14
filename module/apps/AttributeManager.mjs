import { __ID__, filePath } from "../consts.mjs";
import { attributeSorter } from "../utils/attributeSort.mjs";
import { Logger } from "../utils/Logger.mjs";
import { toID } from "../utils/toID.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;
const { deepClone, diffObject, mergeObject, performIntegerSort, randomID, setProperty } = foundry.utils;
const { DragDrop, TextEditor } = foundry.applications.ux;

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

		new DragDrop.implementation({
			dragSelector: `[data-attribute]`,
			permissions: {
				dragstart: this._canDragStart.bind(this),
				drop: this._canDragDrop.bind(this),
			},
			callbacks: {
				dragstart: this._onDragStart.bind(this),
				drop: this._onDrop.bind(this),
			},
		}).bind(this.element);
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
				displayName: data.isNew ? `New Attribute` : data.name,
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

		Logger.debug(`Updating ${binding} value to ${value}`);
		setProperty(this.#attributes, binding, value);
		await this.render({ parts: [ `attributes` ]});
	};

	/** @this {AttributeManager} */
	static async #addNew() {
		const id = randomID();
		this.#attributes[id] = {
			name: ``,
			sort: Number.POSITIVE_INFINITY,
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

	// #region Drag & Drop
	_canDragStart() {
		return this.#doc.isOwner;
	};

	_canDragDrop() {
		return this.#doc.isOwner;
	};

	_onDragStart(event) {
		const target = event.currentTarget;
		if (`link` in event.target.dataset) { return };
		let dragData;

		if (target.dataset.attribute) {
			const attributeID = target.dataset.attribute;
			const attribute = this.#attributes[attributeID];
			dragData = {
				_id: attributeID,
				sort: attribute.sort,
			};
		};

		if (!dragData) { return };
		event.dataTransfer.setData(`text/plain`, JSON.stringify(dragData));
	};

	_onDrop(event) {
		const dropped = TextEditor.implementation.getDragEventData(event);

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
