import { __ID__, filePath } from "../consts.mjs";
import { AttributeManager } from "./AttributeManager.mjs";
import { attributeSorter } from "../utils/attributeSort.mjs";
import { ResizeControlManager } from "./ResizeControlManager.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
const { getProperty } = foundry.utils;

export class PlayerSheet extends HandlebarsApplicationMixin(ActorSheetV2) {

	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`PlayerSheet`,
		],
		position: {
			width: 575,
			height: 740,
		},
		window: {
			resizable: true,
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false,
		},
		actions: {
			manageAttributes: this.#manageAttributes,
			sizeSettings: this.#configureSizeSettings,
		},
	};

	static PARTS = {
		header: { template: filePath(`templates/PlayerSheet/header.hbs`) },
		attributes: { template: filePath(`templates/PlayerSheet/attributes.hbs`) },
		content: { template: filePath(`templates/PlayerSheet/content.hbs`) },
	};
	// #endregion Options

	// #region Lifecycle
	_initializeApplicationOptions(options) {
		const sizing = getProperty(options.document, `flags.${__ID__}.PlayerSheet.size`) ?? {};

		options.window ??= {};
		switch (sizing.resizable) {
			case `false`:
				options.window.resizable ??= false;
				break;
			case `true`:
				options.window.resizable ??= true;
				break;
		};

		options.position ??= {};
		if (sizing.width) {
			options.position.width ??= sizing.width;
		};
		if (sizing.height) {
			options.position.height ??= sizing.height;
		};

		return super._initializeApplicationOptions(options);
	};

	_getHeaderControls() {
		const controls = super._getHeaderControls();

		controls.push({
			icon: `fa-solid fa-at`,
			label: `Manage Attributes`,
			action: `manageAttributes`,
			visible: () => {
				const isGM = game.user.isGM;
				const allowPlayerEdits = game.settings.get(__ID__, `canPlayersManageAttributes`);
				const editable = this.isEditable;
				return isGM || (allowPlayerEdits && editable);
			},
		});
		controls.push({
			icon: `fa-solid fa-crop-simple`,
			label: `Configure Size`,
			action: `sizeSettings`,
			visible: () => {
				const isGM = game.user.isGM;
				return isGM;
			},
		});

		return controls;
	};

	async close() {
		this.#attributeManager?.close();
		this.#attributeManager = null;
		return super.close();
	};
	// #endregion Lifecycle

	// #region Data Prep
	async _preparePartContext(partID) {
		let ctx = {
			actor: this.actor,
			system: this.actor.system,
			editable: this.isEditable,
		};

		switch (partID) {
			case `attributes`: {
				await this._prepareAttributes(ctx);
				break;
			};
			case `content`: {
				await this._prepareContent(ctx);
				break;
			};
		};

		return ctx;
	};

	async _prepareAttributes(ctx) {
		ctx.hasAttributes = this.actor.system.hasAttributes;

		const attrs = [];
		for (const [id, data] of Object.entries(this.actor.system.attr)) {
			attrs.push({
				...data,
				id,
				path: `system.attr.${id}`,
			});
		};
		ctx.attrs = attrs.toSorted(attributeSorter);
	};

	async _prepareContent(ctx) {
		const TextEditor = foundry.applications.ux.TextEditor.implementation;
		ctx.enriched = {
			system: {
				content: await TextEditor.enrichHTML(this.actor.system.content),
			},
		};
	};
	// #endregion Data Prep

	// #region Actions
	#attributeManager = null;
	/** @this {PlayerSheet} */
	static async #manageAttributes() {
		this.#attributeManager ??= new AttributeManager({ document: this.actor });
		if (this.#attributeManager.rendered) {
			await this.#attributeManager.bringToFront();
		} else {
			await this.#attributeManager.render({ force: true });
		};
	};

	#sizeSettings = null;
	/** @this {PlayerSheet} */
	static async #configureSizeSettings() {
		this.#sizeSettings ??= new ResizeControlManager({ document: this.actor });
		if (this.#sizeSettings.rendered) {
			await this.#sizeSettings.bringToFront();
		} else {
			await this.#sizeSettings.render({ force: true });
		};
	};
	// #endregion Actions
};
