// Apps
import { AttributeItemSheet } from "../apps/AttributeItemSheet.mjs";
import { AttributeOnlyPlayerSheet } from "../apps/AttributeOnlyPlayerSheet.mjs";
import { GenericItemSheet } from "../apps/GenericItemSheet.mjs";
import { PlayerSheet } from "../apps/PlayerSheet.mjs";
import { SingleModePlayerSheet } from "../apps/SingleModePlayerSheet.mjs";

// Data Models
import { AttributeItemData } from "../data/Item/attribute.mjs";
import { GenericItemData } from "../data/Item/generic.mjs";
import { PlayerData } from "../data/Actor/player.mjs";

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

	// #region Documents
	CONFIG.Actor.documentClass = TAFActor;
	CONFIG.Combatant.documentClass = TAFCombatant;
	CONFIG.Item.documentClass = TAFItem;
	CONFIG.Token.documentClass = TAFTokenDocument;
	// #endregion Documents

	// #region Data Models
	CONFIG.Actor.dataModels.player = PlayerData;
	CONFIG.Item.dataModels.generic = GenericItemData;
	CONFIG.Item.dataModels.attribute = AttributeItemData;
	// #endregion Data Models

	// #region Sheets
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
	foundry.documents.collections.Actors.registerSheet(
		__ID__,
		AttributeOnlyPlayerSheet,
		{ label: `taf.sheet-names.AttributeOnlyPlayerSheet` },
	);

	foundry.documents.collections.Items.registerSheet(
		__ID__,
		GenericItemSheet,
		{
			types: [`generic`],
			makeDefault: true,
			label: `taf.sheet-names.GenericItemSheet`,
		},
	);
	foundry.documents.collections.Items.registerSheet(
		__ID__,
		AttributeItemSheet,
		{
			types: [`attribute`],
			makeDefault: true,
			label: `taf.sheet-names.AttributeItemSheet`,
		},
	);
	// #endregion Sheets

	registerWorldSettings();

	registerSockets();
	registerCustomComponents();
	Handlebars.registerHelper(helpers);
});
