import { __ID__ } from "../../consts.mjs";
import { Logger } from "../../utils/Logger.mjs";
import { EphemeralObjectField } from "../fields/EphemeralObjectField.mjs";

const { getProperty, hasProperty } = foundry.utils;

export class PlayerData extends foundry.abstract.TypeDataModel {
	// #region Schema
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			content: new fields.HTMLField({
				blank: true,
				trim: true,
				initial: ``,
			}),
			carryCapacity: new fields.NumberField({
				min: 0,
				nullable: true,
				initial: null,
			}),
			attr: new EphemeralObjectField({ initial: {} }),
		};
	};
	// #endregion Schema

	// #region Lifecycle
	/**
	 * This makes sure that the actor gets created with the global
	 * attributes if they exist, while still allowing programmatic
	 * creation through the API with specific attributes.
	 */
	async _preCreate(data, options, user) {

		// Assign the default items from the world setting if required
		const items = this.parent._source.items;
		if (items.length === 0 && !options.cloning) {
			const defaults = game.settings.get(__ID__, `actorDefaultAttributes`) ?? [];
			this.parent.updateSource({ items: defaults });
		};

		return super._preCreate(data, options, user);
	};

	/**
	 * Ensures that the required data structures exist in order for the
	 * derived data to be able to populate itself correctly.
	 */
	prepareBaseData() {
		this.attr = {};
	};

	/**
	 * For every attribute item that the character has, we want that data
	 * accessible in the system data, so we create objects dynamically that
	 * the rest of Foundry can read in to emulate the attributes being on
	 * the Actor directly.
	 */
	prepareDerivedData() {
		const attrs = this.parent.items?.filter(item => item.type === `attribute`);
		for (const attr of attrs) {
			if (attr.system.isRange) {
				this.attr[attr.system.key] = {
					value: attr.system.value,
					max: attr.system.max,
				};
			} else {
				this.attr[attr.system.key] = attr.system.value;
			};
		};
	};

	/**
	 * This handler makes it so that when a user updates the attributes
	 * using a "system.attr.*" property they correctly get removed from the
	 * update and are forwarded to the correct Item document instead
	 */
	async _preUpdate(data, options, user) {
		if (hasProperty(data, `system.attr`)) {
			Logger.info(`Forwarding attribute update(s) to embedded Item(s)`);
			const items = this.parent.itemTypes?.attribute ?? [];
			for (const attr of items) {
				const key = `system.attr.${attr.system.key}`;
				if (hasProperty(data, key)) {
					let value = getProperty(data, key);
					if (attr.system.isRange) {
						attr.update({ system: value });
					} else {
						attr.update({ system: { value }});
					};
				};
			};
		};
	};
	// #endregion Lifecycle

	// #region Getters
	get hasAttributes() {
		return Object.keys(this.attr).length > 0;
	};
	// #endregion Getters
};
