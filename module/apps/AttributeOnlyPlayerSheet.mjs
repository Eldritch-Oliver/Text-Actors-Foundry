import { PlayerSheet } from "./PlayerSheet.mjs";

const { deepClone } = foundry.utils;

export class AttributeOnlyPlayerSheet extends PlayerSheet {
	// #region Options
	static DEFAULT_OPTIONS = {
		position: {
			height: `auto`,
		},
	};

	static get PARTS() {
		const parts = deepClone(super.PARTS);
		delete parts.content;
		return parts;
	};
	// #endregion Options

	// #region Lifecycle
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);

		// don't attempt to rerender the content
		options.parts = options.parts?.filter(partID => partID !== `content`);
	};
	// #endregion Lifecycle
};
