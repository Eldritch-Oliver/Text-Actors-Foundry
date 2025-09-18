import { __ID__, filePath } from "../consts.mjs";

const { HandlebarsApplicationMixin, DocumentSheetV2 } = foundry.applications.api;
const { getProperty } = foundry.utils;

export class ResizeControlManager extends HandlebarsApplicationMixin(DocumentSheetV2) {

	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`ResizeControlManager`,
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
		},
		actions: {},
	};

	static PARTS = {
		settings: { template: filePath(`templates/ResizeControlManager/settings.hbs`) },
		controls: { template: filePath(`templates/ResizeControlManager/controls.hbs`) },
	};
	// #endregion Options

	// #region Instance Data
	get title() {
		return `Sizing Settings For : ${this.document.name}`;
	};
	// #endregion Instance Data

	// #region Data Prep
	async _prepareContext() {
		const sizing = getProperty(this.document, `flags.${__ID__}.PlayerSheet.size`) ?? {};

		const ctx = {
			meta: {
				idp: this.id,
			},
			width: sizing.width,
			height: sizing.height,
			resizable: sizing.resizable,
			resizeOptions: [
				{ label: `Default`, value: `` },
				{ label: `Resizable`, value: `true` },
				{ label: `No Resizing`, value: `false` },
			],
		};

		return ctx;
	};
	// #endregion Data Prep
};
