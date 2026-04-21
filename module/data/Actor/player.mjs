import { __ID__ } from "../../consts.mjs";

export class PlayerData extends foundry.abstract.TypeDataModel {
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
			// attr: new fields.TypedObjectField(
			// 	new fields.SchemaField({
			// 		name: new fields.StringField({ blank: false, trim: true }),
			// 		sort: new fields.NumberField({ min: 1, initial: 1, integer: true, nullable: false }),
			// 		value: new fields.NumberField({ min: 0, initial: 0, integer: true, nullable: false }),
			// 		max: new fields.NumberField({ min: 0, initial: null, integer: true, nullable: true }),
			// 		isRange: new fields.BooleanField({ initial: false, nullable: false }),
			// 	}),
			// 	{
			// 		initial: {},
			// 		nullable: false,
			// 		required: false,
			// 	},
			// ),
			attr: new fields.ObjectField({ persisted: false }),
		};
	};

	// #region Lifecycle
	/**
	 * This makes sure that the actor gets created with the global attributes if
	 * they exist, while still allowing programmatic creation through the API with
	 * specific attributes.
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
	// #endregion Lifecycle

	get hasAttributes() {
		return Object.keys(this.attr).length > 0;
	};
};
