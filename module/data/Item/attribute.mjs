import { isValidID, toID } from "../../utils/toID.mjs";
import { clamp } from "../../utils/clamp.mjs";

const { getProperty, hasProperty, setProperty } = foundry.utils;

export class AttributeItemData extends foundry.abstract.TypeDataModel {
	// #region Schema
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			group: new fields.StringField({
				blank: false,
				trim: true,
				nullable: true,
				initial: null,
			}),
			key: new fields.StringField({
				blank: false,
				trim: true,
				nullable: false,
			}),
			aboveTheFold: new fields.BooleanField({
				initial: false,
			}),

			/* The attributes current value */
			value: new fields.NumberField({
				integer: true,
			}),
			/* The minimum accepted value */
			min: new fields.NumberField({
				integer: true,
			}),
			/* The maximum accepted value */
			max: new fields.NumberField({
				integer: true,
			}),
		};
	};
	// #endregion Schema

	// #region Lifecycle
	async _preCreate(data, options, user) {
		// Assign the key as the ID'd name if isn't provided, or validate if
		// it is provided.
		if (!this.key) {
			this.updateSource({ key: toID(this.parent.name) });
		} else if (!isValidID(this.key)) {
			ui.notifications.error(_loc(
				`taf.notifs.error.invalid-attribute-key`,
				{ key: this.key },
			));
			return false;
		};

		// Prevent duplicate Attribute keys from existing on a single Actor
		if (this.parent.isEmbedded) {
			const attr = this.parent.parent?.getAttribute(this.key);
			if (attr) {
				ui.notifications.error(
					`taf.notifs.error.duplicate-attribute-key`,
					{
						localize: true,
						format: { key: this.key },
					},
				);
				return false;
			};
		};

		return super._preCreate(data, options, user);
	};

	async _preUpdate(data, options, user) {
		const allowed = await super._preUpdate(data, options, user);
		if (allowed === false) { return false };

		// Prevent invalid IDs
		if (hasProperty(data, `system.key`) && !isValidID(data.system.key)) {
			ui.notifications.error(_loc(
				`taf.notifs.error.invalid-attribute-key`,
				{ key: data.system.key },
			));
			delete data.system?.key;
		};

		// Prevent value going out of the bounds of min/max
		if (hasProperty(data, `system.value`)) {
			const value = getProperty(data, `system.value`);
			const max = getProperty(data, `system.max`) ?? this.max;

			let min = getProperty(data, `system.min`) ?? this.min;
			if (max != null) { min ??= 0; };

			setProperty(data, `system.value`, clamp(min, value, max));
		};
	};
	// #endregion Lifecycle

	// #region Methods
	get isRange() {
		return this.max !== null;
	};
	// #endregion Methods
};
