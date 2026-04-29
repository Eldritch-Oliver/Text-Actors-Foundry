import { isValidID, toID } from "../../utils/toID.mjs";
import { __ID__ } from "../../consts.mjs";
import { clamp } from "../../utils/clamp.mjs";

const { getProperty, hasProperty, setProperty } = foundry.utils;

export class AttributeItemData extends foundry.abstract.TypeDataModel {
	// MARK: Schema
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
			trigger: new fields.DocumentUUIDField({
				embedded: false,
				relative: false,
				type: foundry.documents.Macro.documentName,
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

	// #region Lifecycle
	async _preCreate(data, options, user) {
		// Prevent users from creating attributes if disallowed
		if (
			!game.settings.get(__ID__, `canPlayersManageAttributes`)
			&& !user.isGM
		) {
			ui.notifications.error(_loc(`taf.notifs.error.cant-manage-attributes`));
			return false;
		};

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
			if (max != null) { min ??= 0 };

			setProperty(data, `system.value`, clamp(min, value, max));
		};
	};
	// #endregion Lifecycle

	// #region Methods
	get isRange() {
		return this.max !== null;
	};

	get inferredMinimum() {
		if (this.isRange) {
			return this.min ?? 0;
		};
		return null;
	};

	/**
	 * Executes the macro associated with this item, if the macro cannot be
	 * found or if the user does not permission to execute it, it will not be
	 * executed. This also provides some extra context into the roll data for chat
	 * macros, so that they can refer to the min/value/max properties of this
	 * specific item without actually needing to know which item called the macro.
	 */
	async execute() {
		const macro = await fromUuid(this.trigger);
		if (!macro || !macro.canExecute) { return };

		// Provide the chat-specific context when required
		if (macro.type === `chat`) {
			Hooks.once(`taf.getRollData`, (data) => {
				data.active = {
					min: this.min,
					value: this.value,
					max: this.max,
				};
			});
		};

		await macro?.execute({ item: this.parent });
	};
	// #endregion Methods
};
