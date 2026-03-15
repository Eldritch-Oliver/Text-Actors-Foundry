import { PlayerSheet } from "./PlayerSheet.mjs";

const removedParts = new Set([`content`, `tabs`]);

export class AttributeOnlyPlayerSheet extends PlayerSheet {
	// #region Options
	static DEFAULT_OPTIONS = {
		position: {
			height: `auto`,
		},
	};

	static get PARTS() {
		const parts = super.PARTS;
		delete parts.tabs;
		delete parts.content;
		return parts;
	};
	// #endregion Options

	// #region Lifecycle
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);

		// don't attempt to rerender the parts that get removed
		options.parts = options.parts?.filter(partID => !removedParts.has(partID));
	};
	// #endregion Lifecycle

	// #region Data Prep
	async _prepareItems(ctx) {
		await super._prepareItems(ctx);
		ctx.tabActive = true;
	};
	// #endregion Data Prep
};
