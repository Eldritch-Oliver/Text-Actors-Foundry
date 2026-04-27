import { __ID__, filePath } from "../consts.mjs";
import { TAFDocumentSheetMixin } from "./mixins/TAFDocumentSheetMixin.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export class AttributeItemSheet extends
	TAFDocumentSheetMixin(
	HandlebarsApplicationMixin(
	ItemSheetV2,
)) {
	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`AttributeItemSheet`,
		],
		position: {
			width: 350,
			height: `auto`,
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
		header: { template: filePath(`templates/AttributeItemSheet/header.hbs`) },
		value: { template: filePath(`templates/AttributeItemSheet/value.hbs`) },
		settings: { template: filePath(`templates/AttributeItemSheet/settings.hbs`) },
	};

	/**
	 * This tells the Application's TAFDocumentSheetMixin how to rerender
	 * this app when specific properties get changed on the actor, so that
	 * it doesn't need to full-app rendering if we can do a partial
	 * rerender instead.
	 */
	static PROPERTY_TO_PARTIAL = {
		"name": [`header`],
		"system.value": [`value`],
		"system.min": [`value`],
		"system.max": [`value`],
		"system.aboveTheFold": [`settings`],
		"system.group": [`settings`],
		"system.key": [`settings`],
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
	// #endregion Lifecycle

	// #region Actions
	// #endregion Actions
};
