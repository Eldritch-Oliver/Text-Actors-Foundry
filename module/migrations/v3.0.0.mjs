import { __ID__ } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";
import { finishMigrationWarning, migrateCollection, shouldMigrateCompendium } from "./utils.mjs";

const flag = `convertAttributesIntoItems`;
const operations = [];
let compendiumOperations = [];

export async function migrateTo3_0_0() {
	Logger.debug(`Starting v3.0.0 data migration`);
	const packsToMigrate = game.packs.filter(
		(pack) => shouldMigrateCompendium(pack, [`Actor`]),
	);

	const warning = ui.notifications.warn(
		"taf.notifs.warn.migration-in-progress",
		{
			localize: true,
			format: { version: `3.0.0` },
			progress: true,
			permanent: true,
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
	warning.update({ pct: 0.25, });

	for (const pack of packsToMigrate) {
		await pack.getDocuments();

		const wasLocked = pack.config.locked;
		if (wasLocked) await pack.configure({ locked: false });

		compendiumOperations.push(
			...await migrateCollection(
				pack,
				flag,
				handleMigratingActor,
				{ pack: pack.collection, update: false, },
			),
		);

		await foundry.documents.modifyBatch(compendiumOperations);

		if (wasLocked) await pack.configure({ locked: true });

		compendiumOperations = [];
	};

	warning.update({ pct: 0.8 });

	await foundry.documents.modifyBatch(operations);

	finishMigrationWarning(warning, `3.0.0`);
};

function handleMigratingActor(actor, options) {
	const operation = {
		action: `create`,
		broadcast: true,
		documentName: `Item`,
		parent: actor,
		pack: options.pack,
		noHook: true,
		data: [],
	};

	const attrs = actor.getFlag(__ID__, flag) ?? {};
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
