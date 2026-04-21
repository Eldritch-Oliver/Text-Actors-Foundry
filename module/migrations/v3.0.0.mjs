import { Logger } from "../utils/Logger.mjs";
import { migrateCollection, shouldMigrateCompendium } from "./utils.mjs";

const flag = `convertAttributesIntoItems`;
const operations = [];
let compendiumOperations = [];

export async function migrateTo3_0_0() {
	Logger.debug(`Starting v3.0.0 data migration`);
	const packsToMigrate = game.packs.filter(
		(pack) => shouldMigrateCompendium(pack, [`Actor`]),
	);
	const intervalSize = 1 / (packsToMigrate.length + 1);

	const warning = ui.notifications.warn(
		"taf.notifs.warn.migration-in-progress",
		{
			format: { version: `v3.0.0` },
			progress: true,
			permanent: true,
			console: false,
		},
	);

	operations.push(
		...await migrateCollection(
			game.actors,
			flag,
			handleMigratingActor,
			{ update: false, },
		),
	);
	warning.update({ pct: warning.pct + intervalSize });

	for (const pack of packsToMigrate) {
		await pack.getDocuments();

		const wasLocked = pack.config.locked;
		if (wasLocked) pack.configure({ locked: false });

		compendiumOperations.push(
			...await migrateCollection(
				pack,
				flag,
				handleMigratingActor,
				{ pack, update: false, },
			),
		);

		// foundry.documents.modifyBatch(compendiumOperations);
		console.log(`compendiumOperations`, compendiumOperations);

		if (wasLocked) await pack.configure({ locked: true });

		compendiumOperations = [];
		warning.update({ pct: warning.pct + intervalSize });
	};

	// TODO: re-lock packs here?

	warning.update({ pct: 1 });

	// TODO: create the item documents (batch them if possible)
	Logger.debug(`Finished v3.0.0 migration, resulting operations:`);
	console.log(operations);
	// Use: foundry.documents.modifyBatch
	// await foundry.documents.modifyBatch(operations);
};

function handleMigratingActor(actor) {
	console.log(actor);

	const operation = {
		action: `create`,
		documentName: `Item`,
		parent: actor,
		noHook: true,
		data: [],
	};

	const attrs = actor.system?.attr ?? {};
	for (const [ key, attr ] of Object.entries(attrs)) {
		operation.data.push(convertToItem(key, attr));
	};

	// No items to create, don't queue the operation
	if (operation.data.length > 0) {
		if (actor.inCompendium) {
			compendiumOperations.push(operation);
		} else {
			operations.push(operation);
		};
	};

	return {
		"system.attr": _del,
	};
};

function convertToItem(key, attr) {
	return {
		name: attr.name,
		type: "attribute",
		system: {
			key,
			value: attr.value,
			max: attr.isRange ? attr.max : null,
			aboveTheFold: true,
		},
	};
};
