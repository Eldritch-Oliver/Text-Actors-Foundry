import { __ID__, filePath } from "../consts.mjs";
import { TAFDocumentSheetMixin } from "./mixins/TAFDocumentSheetMixin.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;
const { setProperty } = foundry.utils;

export class GenericItemSheet extends
	TAFDocumentSheetMixin(
	HandlebarsApplicationMixin(
	ItemSheetV2,
)) {
	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`GenericItemSheet`,
		],
		position: {
			width: 400,
			height: 450,
		},
		window: {
			resizable: true,
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false,
		},
		actions: {},
	};

	static PARTS = {
		header: { template: filePath(`templates/GenericItemSheet/header.hbs`) },
		content: { template: filePath(`templates/GenericItemSheet/content.hbs`) },
	};

	/**
	 * This tells the Application's TAFDocumentSheetMixin how to rerender this app
	 * when specific properties get changed on the actor, so that it doesn't need
	 * to full-app rendering if we can do a partial rerender instead.
	 */
	static PROPERTY_TO_PARTIAL = {
		"name": [`header`],
		"img": [`header`],
		"system": [`content`],
	};
	// #endregion Options

	// #region Instance Data
	// #endregion Instance Data

	// #region Lifecycle
	async _prepareContext() {
		return {
			meta: {
				idp: this.id,
				editable: this.isEditable,
				limited: this.isLimited,
			},
			item: this.item,
			system: this.item.system,
		};
	};

	async _preparePartContext(partID, ctx) {
		switch (partID) {
			case `content`: {
				await this._prepareContentContext(ctx);
				break;
			};
		};

		return ctx;
	};

	async _prepareContentContext(ctx) {
		const TextEditor = foundry.applications.ux.TextEditor.implementation;

		setProperty(
			ctx,
			`enriched.system.description`,
			await TextEditor.enrichHTML(this.item.system.description),
		);
	};
	// #endregion Lifecycle

	// #region Actions
	// #endregion Actions
};
