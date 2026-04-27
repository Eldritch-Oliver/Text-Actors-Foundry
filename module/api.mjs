// Apps
import { Ask } from "./apps/Ask.mjs";
import { PlayerSheet } from "./apps/PlayerSheet.mjs";
import { QueryStatus } from "./apps/QueryStatus.mjs";

// Utils
import { isValidID, toID } from "./utils/toID.mjs";
import { attributeSorter } from "./utils/attributeSort.mjs";
import { DialogManager } from "./utils/DialogManager.mjs";
import { localizer } from "./utils/localizer.mjs";
import { QueryManager } from "./utils/QueryManager.mjs";

const { deepFreeze } = foundry.utils;

export const api = deepFreeze({
	DialogManager,
	QueryManager,
	Apps: {
		Ask,
		PlayerSheet,
		QueryStatus,
	},
	utils: {
		attributeSorter,
		localizer,
		toID,
		isValidID,
	},
});
