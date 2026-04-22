export class AttributeItemData extends foundry.abstract.TypeDataModel {
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
				nullable: true,
				initial: null,
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

	get isRange() {
		return this.max !== null;
	};
};
