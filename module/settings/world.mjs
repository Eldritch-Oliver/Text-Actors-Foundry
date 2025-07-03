import { __ID__ } from "../consts.mjs";

export function registerWorldSettings() {
	game.settings.register(__ID__, `canPlayersManageAttributes`, {
		name: `taf.settings.canPlayersManageAttributes.name`,
		hint: `taf.settings.canPlayersManageAttributes.hint`,
		config: true,
		type: Boolean,
		default: false,
		scope: `world`,
	});
};
