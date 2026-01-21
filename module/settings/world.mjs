import { __ID__ } from "../consts.mjs";

const { NumberField, StringField } = foundry.data.fields;

export function registerWorldSettings() {

	game.settings.register(__ID__, `initiativeFormula`, {
		name: `taf.settings.initiativeFormula.name`,
		hint: `taf.settings.initiativeFormula.hint`,
		config: true,
		type: String,
		default: `1d20`,
		scope: `world`,
	});

	game.settings.register(__ID__, `canPlayersManageAttributes`, {
		name: `taf.settings.canPlayersManageAttributes.name`,
		hint: `taf.settings.canPlayersManageAttributes.hint`,
		config: true,
		type: Boolean,
		default: false,
		scope: `world`,
	});

	game.settings.register(__ID__, `sheetDefaultWidth`, {
		name: `taf.settings.sheetDefaultWidth.name`,
		hint: `taf.settings.sheetDefaultWidth.hint`,
		config: true,
		type: new NumberField({
			min: 0,
			nullable: true,
		}),
		scope: `world`,
	});

	game.settings.register(__ID__, `sheetDefaultHeight`, {
		name: `taf.settings.sheetDefaultHeight.name`,
		hint: `taf.settings.sheetDefaultHeight.hint`,
		config: true,
		type: new NumberField({
			min: 0,
			nullable: true,
		}),
		scope: `world`,
	});

	game.settings.register(__ID__, `sheetDefaultResizable`, {
		name: `taf.settings.sheetDefaultResizable.name`,
		hint: `taf.settings.sheetDefaultResizable.hint`,
		config: true,
		type: new StringField({
			blank: true,
			initial: ``,
			choices: {
				"": `taf.settings.sheetDefaultResizable.choices.default`,
				"false": `taf.settings.sheetDefaultResizable.choices.false`,
				"true": `taf.settings.sheetDefaultResizable.choices.true`,
			},
		}),
		scope: `world`,
	});
};
