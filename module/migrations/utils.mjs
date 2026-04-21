import { __ID__ } from "../consts.mjs";

/**
 * Migrate the documents within a collection based on what
 *
 * This function was originally reproduced from [Draw Steel's codebase](https://github.com/MetaMorphic-Digital/draw-steel/blob/82a0a050da7c0d6d28c0cd283cf3b6915f47ee2a/src/module/data/migrations.mjs#L206-L226),
 * with modifications to it to work better without
 *
 * @param collection The Collection of documents to update.
 * @param flag The flag name to reference for if the document should be migrated.
 * @param convertor The function that takes the document and performs the.
 * transformations to get the required update data.
 * @param options Options to configure how the method behaves.
 * @param options.pack The compendium pack to update.
 * @param options.parent Parent of the collection for embedded collections.
 * @param options.update Whether or not this method should perform the update, or pass back the array of DB operations.
 * @returns An array of batch operations to perform.
 */
export async function migrateCollection(
	collection,
	flag,
	convertor,
	options = {}
) {
	const toMigrate = collection
		.filter(doc => doc.getFlag(__ID__, flag))
		.map(doc => {
			const update = convertor(doc, options) ?? {};
			update[`_id`] = doc._id;

			// v13/v14+ compatibility shim
			if (game.release.generation > 13) {
				update[`flags.${__ID__}.${flag}`] = _del;
			} else {
				update[`flags.${__ID__}.-=${flag}`] = null;
			};

			return update;
		})
		.filter(data => !!data);

	if (!options.update) {
		return [{
			action: `update`,
			broadcast: true,
			documentName: collection.documentName,
			updates: toMigrate,
			noHook: true,
			pack: options.pack,
			parent: options.parent,
		}];
	};

	// Modify in batches of 100
	const batches = Math.ceil(toMigrate.length / 100);
	for (let i = 0; i < batches; i++) {
		const updateData = toMigrate.slice(i * 100, (i + 1) * 100);
		await collection.documentClass.updateDocuments(
			updateData,
			{
				pack: options.pack,
				parent: options.parent,
				diff: false,
			},
		);
	};
};

/**
 * Determine whether a compendium pack should be migrated during `migrateWorld`.
 *
 * This function was reproduced from [Draw Steel's codebase](https://github.com/MetaMorphic-Digital/draw-steel/blob/82a0a050da7c0d6d28c0cd283cf3b6915f47ee2a/src/module/data/migrations.mjs#L287-L302)
 *
 * @param pack The CompendiumPack document
 * @returns {boolean} Whether or not the pack should be migrated
 */
export function shouldMigrateCompendium(pack, types = [`Actor`, `Item`]) {
	// We only care about actor and item migrations
	if (!types.includes(pack.documentName)) return false;

	// World compendiums should all be migrated, system ones should never by migrated
	if (pack.metadata.packageType === "world") return true;
	if (pack.metadata.packageType === "system") return false;

	// Module compendiums should only be migrated if they don't have a download or manifest URL
	const module = game.modules.get(pack.metadata.packageName);
	return !module.download && !module.manifest;
};

export function finishMigrationWarning(warning, version) {
	warning.update({ pct: 1 });
	setTimeout(
		() => {
			warning.remove();
			ui.notifications.success(
				`taf.notifs.success.migration-successful`,
				{
					localize: true,
					format: { version },
				},
			);
		},
		3_000,
	);
};
