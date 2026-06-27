import { __ID__ } from "../consts.mjs";
import { ask } from "../utils/DialogManager.mjs";
import { clamp } from "../utils/clamp.mjs";

const { Actor } = foundry.documents;
const { deepClone, diffObject, hasProperty, setProperty } = foundry.utils;

export class TAFActor extends Actor {

	// #region Lifecycle
	/**
	 * Ensure that the relevant prototype token properties get updated whenever
	 * the actor properties are updated so that they stay in sync UNLESS the
	 * prototype token already differs from the actor's value.
	 */
	async _preUpdate(data, options, user) {
		const diff = diffObject(this._source, data);

		// Name
		if (hasProperty(diff, `name`) && this.prototypeToken.name === this.name) {
			setProperty(data, `prototypeToken.name`, diff.name);
		};

		// Image
		if (hasProperty(diff, `img`) && this.prototypeToken.texture.src === this.img) {
			setProperty(data, `prototypeToken.texture.src`, diff.img);
		};

		return super._preUpdate(data, options, user);
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

	/**
	 * This override allows the _preCreate operations to see whether the actor is
	 * being cloned or created from nothing. This allows for easy one-time operations
	 * that should be performed during Actor creation but not duplication to occur.
	 */
	async clone(data, context) {
		context.cloning = true;

		const response = await ask(
			{
				id: `cloning-${this.id}`,
				window: {
					title: _loc(
						`taf.misc.duplicate-type`,
						{ type: _loc(this.constructor.metadata.label) },
					),
				},
				inputs: [
					{
						key: `name`,
						type: `input`,
						inputType: `text`,
						label: _loc(`DOCUMENT.FIELDS.name.label`),
						defaultValue: data.name ?? ``,
					},
				],
			},
			{
				onlyOneWaiting: true,
				alwaysUseAnswerObject: true,
			},
		);
		if (response.state !== `prompted` || !response.answers) { return };

		const newName = response.answers.name;
		data.name = newName;
		data.prototypeToken ??= {};
		data.prototypeToken.name = newName;

		return super.clone(data, context);
	};
	// #endregion Lifecycle

	// #region Token Attributes
	/**
	 * @override
	 * This override exists in order to support making updates to the Actor's
	 * embedded attribute Items from the token, or falling back to the default
	 * handling if it's not one of our attributes.
	 */
	async modifyTokenAttribute(attribute, value, isDelta = false, isBar = true) {
		if (attribute.startsWith(`attr.`)) {
			const key = attribute.slice(5);
			const attr = this.getAttribute(key);
			value = isDelta ? attr.system.value + value : value;
			value = clamp(attr.system.min, value, attr.system.max);
			const updates = { system: { value } };

			const allowed = Hooks.call(
				`modifyTokenAttribute`,
				{ attribute, value, isDelta, isBar, isEmbedded: true },
				updates,
				this,
			);

			return allowed !== false ? await attr.update(updates) : this;
		};

		const attr = foundry.utils.getProperty(this.system, attribute);
		const current = isBar ? attr.value : attr;
		const update = isDelta ? current + value : value;
		if ( update === current ) {
			return this;
		};

		return super.modifyTokenAttribute(attribute, value, isDelta, isBar);
	};
	// #endregion Token Attributes

	// #region Roll Data
	getRollData() {
		const data = {
			carryCapacity: this.system.carryCapacity ?? null,
			...this.system.attr,
		};

		Hooks.callAll(`taf.getRollData`, data, this);

		return data;
	};
	// #endregion Roll Data

	// #region Methods
	#sortedTypes = null;
	/**
	 * @override
	 * This override is intended to allow the "generic" item subtype to instead
	 * populate the Item types based on their "Group" property, for any other item
	 * subtype this function operates the same way that the default Foundry
	 * implementation does.
	 */
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

	/**
	 * Retrieves an attribute Item from the actor, used to more easily
	 *
	 * @param {string} key The unique identifier of the attribute
	 * @returns The attribute's Item document, or undefined if not found
	 */
	getAttribute(key) {
		const attrs = this.itemTypes.attribute ?? [];
		return attrs.find(attr => attr.system.key === key);
	};

	/**
	 * Updates an embedded attribute Item with a new value.
	 *
	 * @param {string} key The unique identifier of the attribute
	 * @param {number} value The value to set the attribute to
	 */
	async setAttributeValue(key, value) {
		const item = this.getAttribute(key);
		await item?.update({system: { value }});
	};
	// #endregion Methods

	// #region Data Migration
	/**
	 * This checks and performs all data migrations that the system requires, some
	 * of these are one-time only migrations, others of them will happen every time
	 * an Actor is updated.
	 *
	 * The defaulting of options is provided to ensure that the migration doesn't
	 * cause errors in Foundry v13
	 */
	static migrateData(data, options = {}) {
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

	// #region Static API
	/**
	 * Sets the default attributes that are created when a new Actor is created,
	 * this uses all of the existing values that are a part of the items, it does
	 * not prompt for default values.
	 */
	static async setDefaultAttributes(actor) {
		if (!game.user.isGM) { return };
		const minifiedData = [];

		const attrs = actor.itemTypes.attribute ?? [];
		for (const attr of attrs) {
			const raw = attr.toObject();
			minifiedData.push({
				img: raw.img, // doesn't really matter but ¯\_(ツ)_/¯
				name: raw.name,
				type: raw.type,
				system: raw.system,
			});
		};

		game.settings.set(__ID__, `actorDefaultAttributes`, minifiedData);
		ui.notifications.success(_loc(`taf.notifs.success.saved-default-attributes`));
	};
	// #endregion Static API
};
