// Apps
import { PlayerSheet } from "../apps/PlayerSheet.mjs";

// Data Models
import { PlayerData } from "../data/Player.mjs";

// Documents
import { TAFActor } from "../documents/Actor.mjs";
import { TAFItem } from "../documents/Item.mjs";
import { TAFTokenDocument } from "../documents/Token.mjs";

// Settings
import { registerUserSettings } from "../settings/user.mjs";
import { registerWorldSettings } from "../settings/world.mjs";

// Utils
import { __ID__ } from "../consts.mjs";
import helpers from "../handlebarsHelpers/_index.mjs";
import { Logger } from "../utils/Logger.mjs";
import { registerCustomComponents } from "../apps/elements/_index.mjs";
import { registerSockets } from "../sockets/_index.mjs";

Hooks.on(`init`, () => {
	Logger.debug(`Initializing`);

	CONFIG.Token.documentClass = TAFTokenDocument;
	CONFIG.Actor.documentClass = TAFActor;

	CONFIG.Actor.dataModels.player = PlayerData;

	// We disable items in the system for now
	CONFIG.Item.documentClass = TAFItem;
	delete CONFIG.ui.sidebar.TABS.items;

	foundry.documents.collections.Actors.registerSheet(
		__ID__,
		PlayerSheet,
		{
			makeDefault: true,
			label: `taf.sheet-names.PlayerSheet`,
		},
	);

	registerWorldSettings();
	registerUserSettings();

	registerSockets();
	registerCustomComponents();
	Handlebars.registerHelper(helpers);
});
