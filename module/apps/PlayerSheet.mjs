import { __ID__, filePath } from "../consts.mjs";
import { AttributeManager } from "./AttributeManager.mjs";
import { attributeSorter } from "../utils/attributeSort.mjs";
import { TAFDocumentSheetConfig } from "./TAFDocumentSheetConfig.mjs";

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
			configureSheet: this.#configureSheet,
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
		const setting = {
			width: game.settings.get(__ID__, `sheetDefaultWidth`),
			height: game.settings.get(__ID__, `sheetDefaultHeight`),
			resizable: game.settings.get(__ID__, `sheetDefaultResizable`),
		};

		options.window ??= {};
		if (sizing.resizable !== ``) {
			options.window.resizable ??= sizing.resizable === `true`;
		}
		else if (setting.resizable !== ``) {
			options.window.resizable ??= setting.resizable === `true`;
		};

		options.position ??= {};

		// Set width
		if (sizing.width) {
			options.position.width ??= sizing.width;
		}
		else if (setting.width) {
			options.position.width ??= setting.width;
		};

		// Set height
		if (sizing.height) {
			options.position.height ??= sizing.height;
		}
		else if (setting.height) {
			options.position.height ??= setting.height;
		};

		return super._initializeApplicationOptions(options);
	};

	_getHeaderControls() {
		const controls = super._getHeaderControls();

		controls.push({
			icon: `fa-solid fa-at`,
			label: `taf.Apps.PlayerSheet.manage-attributes`,
			action: `manageAttributes`,
			visible: () => {
				const isGM = game.user.isGM;
				const allowPlayerEdits = game.settings.get(__ID__, `canPlayersManageAttributes`);
				const editable = this.isEditable;
				return isGM || (allowPlayerEdits && editable);
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
		// Whether or not the prose-mirror is toggled or always-edit
		ctx.toggled = true;

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
			await this.#attributeManager.render({
				force: true,
				window: { windowId: this.window.windowId },
			});
		};
	};

	static async #configureSheet(event) {
		event.stopPropagation();
		if ( event.detail > 1 ) { return }

		new TAFDocumentSheetConfig({
			document: this.document,
			position: {
				top: this.position.top + 40,
				left: this.position.left + ((this.position.width - 60) / 2),
			},
		}).render({
			force: true,
			window: { windowId: this.window.windowId },
		});
	};
	// #endregion Actions
};
