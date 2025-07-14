export class PlayerData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			content: new fields.HTMLField({
				blank: true,
				trim: true,
				initial: ``,
			}),
			attr: new fields.TypedObjectField(
				new fields.SchemaField({
					name: new fields.StringField({ blank: false, trim: true }),
					sort: new fields.NumberField({ min: 1, initial: 1, integer: true, nullable: false }),
					value: new fields.NumberField({ min: 0, initial: 0, integer: true, nullable: false }),
					max: new fields.NumberField({ min: 0, initial: null, integer: true, nullable: true }),
					isRange: new fields.BooleanField({ initial: false, nullable: false }),
				}),
				{
					initial: {},
					nullable: false,
					required: true,
				},
			),
		};
	};

	get hasAttributes() {
		return Object.keys(this.attr).length > 0;
	};
};
