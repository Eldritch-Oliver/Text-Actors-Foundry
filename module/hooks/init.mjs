// Apps
import { PlayerSheet } from "../apps/PlayerSheet.mjs";
import { SingleModePlayerSheet } from "../apps/SingleModePlayerSheet.mjs";

// Data Models
import { PlayerData } from "../data/Player.mjs";

// Documents
import { TAFActor } from "../documents/Actor.mjs";
import { TAFCombatant } from "../documents/Combatant.mjs";
import { TAFItem } from "../documents/Item.mjs";
import { TAFTokenDocument } from "../documents/Token.mjs";

// Settings
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
	CONFIG.Combatant.documentClass = TAFCombatant;

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
	foundry.documents.collections.Actors.registerSheet(
		__ID__,
		SingleModePlayerSheet,
		{ label: `taf.sheet-names.SingleModePlayerSheet` },
	);

	registerWorldSettings();

	registerSockets();
	registerCustomComponents();
	Handlebars.registerHelper(helpers);
});
