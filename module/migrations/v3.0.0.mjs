import { Logger } from "../utils/Logger.mjs";
import { migrateCollection, shouldMigrateCompendium } from "./utils.mjs";

const flag = `convertAttributesIntoItems`;
const operations = [];

export async function migrateTo3_0_0() {
	Logger.debug(`Starting v3.0.0 data migration`);

	operations.push(
		...await migrateCollection(
			game.actors,
			flag,
			handleMigratingActor,
			{ update: false, },
		),
	);

	// for (const pack of game.packs) {
	// 	if (
	// 		pack.metadata.type !== "Actor"
	// 		|| !shouldMigrateCompendium(pack)
	// 	) {
	// 		continue;
	// 	};

	// 	await pack.getDocuments();

	// 	// TODO: unlock compendium if required then re-lock after finishing
	// 	await migrateCollection(
	// 		pack,
	// 		flag,
	// 		handleMigratingActor,
	// 		{ pack },
	// 	);
	// };

	// TODO: create the item documents (batch them if possible)
	Logger.debug(`Finished v3.0.0 migration, resulting operations:`);
	console.log(operations);
};

function handleMigratingActor(actor) {
	console.log(actor);

	const operation = {
		action: `create`,
		documentName: `Item`,
		parent: actor,
		data: [],
	};

	const attrs = actor.system.attr;
	for (const [ key, attr ] of Object.entries(attrs)) {
		operation.data.push(convertToItem(key, attr));
	};
	operations.push(operation);

	return null;
};

function convertToItem(key, attr) {
	return {
		name: attr.name,
		type: "attribute",
		system: {
			key,
			value: attr.value,
			max: attr.isRange ? attr.max : null,
		},
	};
};
