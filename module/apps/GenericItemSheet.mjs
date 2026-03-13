import { __ID__, filePath } from "../consts.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

export class GenericItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
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
	// #endregion Options

	// #region Instance Data
	// #endregion Instance Data

	// #region Lifecycle
	async _prepareContext(partID) {
		return {
			item: this.item,
			system: this.item.system,
		};
	};
	// #endregion Lifecycle

	// #region Actions
	// #endregion Actions
};
