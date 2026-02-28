import { PlayerSheet } from "./PlayerSheet.mjs";

export class SingleModePlayerSheet extends PlayerSheet {
	// #region Data Prep
	async _prepareContent(ctx) {
		await super._prepareContent(ctx);
		ctx.toggled = false;
	};
	// #endregion Data Prep
};
