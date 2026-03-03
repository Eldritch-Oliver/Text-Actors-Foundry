import { __ID__ } from "../consts.mjs";

const { Actor } = foundry.documents;
const { hasProperty } = foundry.utils;

export class TAFActor extends Actor {

	// #region Lifecycle
	async _preCreate(data, options, user) {

		// Assign the defaults from the world setting if they exist
		const defaults = game.settings.get(__ID__, `actorDefaultAttributes`) ?? {};
		if (!hasProperty(data, `system.attr`)) {
			const value = game.release.generation > 13 ? _replace(defaults) : defaults;
			this.updateSource({ "system.==attr": value });
		};

		return super._preCreate(data, options, user);
	};
	// #endregion Lifecycle

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

	getRollData() {
		const data = {};

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
};
