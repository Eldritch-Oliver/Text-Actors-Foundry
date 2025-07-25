// Apps
import { PlayerSheet } from "../apps/PlayerSheet.mjs";

// Data Models
import { PlayerData } from "../data/Player.mjs";

// Documents
import { TAFActor } from "../documents/Actor.mjs";
import { TAFTokenDocument } from "../documents/Token.mjs";

// Settings
import { registerWorldSettings } from "../settings/world.mjs";

// Utils
import { __ID__ } from "../consts.mjs";
import helpers from "../handlebarsHelpers/_index.mjs";
import { Logger } from "../utils/Logger.mjs";
import { registerCustomComponents } from "../apps/elements/_index.mjs";

Hooks.on(`init`, () => {
	Logger.debug(`Initializing`);

	CONFIG.Token.documentClass = TAFTokenDocument;
	CONFIG.Actor.documentClass = TAFActor;

	CONFIG.Actor.dataModels.player = PlayerData;

	foundry.documents.collections.Actors.registerSheet(
		__ID__,
		PlayerSheet,
		{
			makeDefault: true,
			label: `taf.sheet-names.PlayerSheet`,
		},
	);

	registerWorldSettings();

	registerCustomComponents();
	Handlebars.registerHelper(helpers);
});
