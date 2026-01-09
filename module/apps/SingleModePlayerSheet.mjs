import { PlayerSheet } from "./PlayerSheet.mjs";

export class SingleModePlayerSheet extends PlayerSheet {
	async _prepareContent(ctx) {
		await super._prepareContent(ctx);
		ctx.toggled = false;
	};
};
