import { __ID__, filePath } from "../consts.mjs";
import { AttributeManager } from "./AttributeManager.mjs";
import { attributeSorter } from "../utils/attributeSort.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

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
		},
	};

	static PARTS = {
		header: { template: filePath(`templates/PlayerSheet/header.hbs`) },
		attributes: { template: filePath(`templates/PlayerSheet/attributes.hbs`) },
		content: { template: filePath(`templates/PlayerSheet/content.hbs`) },
	};
	// #endregion Options

	// #region Lifecycle
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

		return controls;
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
	/** @this {PlayerSheet} */
	static async #manageAttributes() {
		const app = new AttributeManager({ document: this.actor });
		await app.render({ force: true });
	};
	// #endregion Actions
};
