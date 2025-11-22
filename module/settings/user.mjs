import { __ID__ } from "../consts.mjs";

export function registerUserSettings() {
	game.settings.register(__ID__, `openSheetInEdit`, {
		name: `taf.settings.openSheetInEdit.name`,
		hint: `taf.settings.openSheetInEdit.hint`,
		config: true,
		type: Boolean,
		default: false,
		scope: `user`,
	});
};
