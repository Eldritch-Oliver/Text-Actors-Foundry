import { toPrecision } from "../../utils/roundToPrecision.mjs";

export class GenericItemData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			group: new fields.StringField({
				blank: false,
				trim: true,
				initial: null,
				nullable: true,
			}),
			weight: new fields.NumberField({
				min: 0,
				initial: 0,
				nullable: false,
			}),
			quantity: new fields.NumberField({
				integer: true,
				min: 0,
				initial: 1,
			}),
			equipped: new fields.BooleanField({
				initial: true,
			}),
			description: new fields.HTMLField({
				blank: true,
				trim: true,
				initial: ``,
			}),
		};
	};

	/**
	 * Calculates the total weight of the item based on the quantity of it, this
	 * rounds the number to the nearest 2 decimal places.
	 */
	get quantifiedWeight() {
		return toPrecision(this.weight * this.quantity, 2);
	};
};
