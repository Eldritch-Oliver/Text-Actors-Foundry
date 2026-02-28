import { PlayerSheet } from "./PlayerSheet.mjs";

export class AttributeOnlyPlayerSheet extends PlayerSheet {
	// #region Options
	static DEFAULT_OPTIONS = {
		position: {
			height: `auto`,
		},
	};

	static get PARTS() {
		const parts = super.PARTS;
		delete parts.content;
		return parts;
	};
	// #endregion Options
};
