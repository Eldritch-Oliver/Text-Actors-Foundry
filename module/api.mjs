// Apps
import { Ask } from "./apps/Ask.mjs";
import { AttributeManager } from "./apps/AttributeManager.mjs";
import { PlayerSheet } from "./apps/PlayerSheet.mjs";

// Utils
import { attributeSorter } from "./utils/attributeSort.mjs";
import { DialogManager } from "./utils/DialogManager.mjs";
import { QueryManager } from "./utils/QueryManager.mjs";
import { toID } from "./utils/toID.mjs";

const { deepFreeze } = foundry.utils;

Object.defineProperty(
	globalThis,
	`taf`,
	{
		value: deepFreeze({
			DialogManager,
			QueryManager,
			Apps: {
				Ask,
				AttributeManager,
				PlayerSheet,
			},
			utils: {
				attributeSorter,
				toID,
			},
		}),
	},
);
