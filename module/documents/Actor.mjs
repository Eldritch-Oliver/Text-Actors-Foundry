import { __ID__ } from "../consts.mjs";

const { Actor } = foundry.documents;
const { deepClone, hasProperty, setProperty } = foundry.utils;

export class TAFActor extends Actor {

	// #region Lifecycle
	/**
	 * This makes sure that the actor gets created with the global attributes if
	 * they exist, while still allowing programmatic creation through the API with
	 * specific attributes.
	 */
	async _preCreate(data, options, user) {

		// Assign the defaults from the world setting if they exist
		const defaults = game.settings.get(__ID__, `actorDefaultAttributes`) ?? {};
		if (!hasProperty(data, `system.attr`)) {
			// Remove with issue: Foundry/taf#55
			const value = game.release.generation > 13 ? _replace(defaults) : defaults;
			this.updateSource({ "system.==attr": value });
		};

		return super._preCreate(data, options, user);
	};

	/**
	 * This resets the cache of the item groupings whenever a descedant document
	 * gets changed (created, updated, deleted) so that we keep the cache as close
	 * to accurate as can be possible.
	 */
	_onEmbeddedDocumentChange(...args) {
		super._onEmbeddedDocumentChange(...args);
		this.#sortedTypes = null;
	};
	// #endregion Lifecycle

	// #region Token Attributes
	async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
		const attr = foundry.utils.getProperty(this.system, attribute);
		const current = isBar ? attr.value : attr;
		const update = isDelta ? current + value : value;
		if ( update === current ) {
			return this;
		};

		// Determine the updates to make to the actor data
		let updates;
		if (isBar) {
			updates = {[`system.${attribute}.value`]: Math.clamp(update, 0, attr.max)};
		} else {
			updates = {[`system.${attribute}`]: update};
		};

		// Allow a hook to override these changes
		const allowed = Hooks.call(`modifyTokenAttribute`, {attribute, value, isDelta, isBar}, updates, this);

		return allowed !== false ? this.update(updates) : this;
	};
	// #endregion Token Attributes

	// #region Roll Data
	getRollData() {
		/*
		All properties assigned during this phase of the roll data prep can potentially
		be overridden by users creating attributes of the same key, if users shouldn't
		be able to override, assign the property before the return of this function.
		*/
		const data = {
			carryCapacity: this.system.carryCapacity ?? null,
		};

		if (`attr` in this.system) {
			for (const attrID in this.system.attr) {
				const attr = this.system.attr[attrID];
				if (attr.isRange) {
					data[attrID] = {
						value: attr.value,
						max: attr.max,
					};
				} else {
					data[attrID] = attr.value;
				};
			};
		};

		return data;
	};
	// #endregion Roll Data

	// #region Getters
	#sortedTypes = null;
	get itemTypes() {
		if (this.#sortedTypes) { return this.#sortedTypes };
		const types = {};
		for (const item of this.items) {
			if (item.type !== `generic`) {
				types[item.type] ??= [];
				types[item.type].push(item);
			} else {
				const group = item.system.group?.toLowerCase() ?? `items`;
				types[group] ??= [];
				types[group].push(item);
			};
		};
		return this.#sortedTypes = types;
	};
	// #endregion Getters

	// #region Data Migration
	/**
	 * This checks and performs all data migrations that the system requires, some
	 * of these are one-time only migrations, others of them will happen every time
	 * an Actor is updated.
	 */
	static migrateData(data, options) {
		this.#migrateToAttributeItems(data, options);
		return super.migrateData(data, options);
	};

	/**
	 * This method handles checking if the Actor has attributes within it's raw
	 * system data model, which was where attributes were stored originally, if
	 * it detects the need for a migration, it stores the existing attribute data
	 * into a flag so that the v3.0.0 migration script can handle creating the
	 * data and removing the property from the Actor.
	 */
	static #migrateToAttributeItems(data, options) {
		if (options.partial) { return }
		const attr = data.system?.attr ?? {};
		if (Object.keys(attr).length > 0) {
			setProperty(
				data,
				`flags.${__ID__}.convertAttributesIntoItems`,
				deepClone(attr),
			);
		};
	};
	// #endregion Data Migration
};
