/**
 * This data field functions the same way as Foundry's ObjectField
 * however it permits changes to internal properties to be tracked in
 * a diff, without committing those changes to the database unless it's
 * removing the entire object.
 */
export class EphemeralObjectField extends foundry.data.fields.ObjectField {

	/**
	 * Inverting the defaults from ObjectField since we don't want it to
	 * be stored in the database anyway
	 */
	static get _defaults() {
		return Object.assign(super._defaults, { required: false, nullable: true });
	};

	/**
	 * When trying to diff the object, only allow deletions to go through,
	 * otherwise ignore it entirely
	 */
	_updateDiff(key, value, options, state) {
		if (
			!value
			|| (value instanceof foundry.data.operators.ForcedDeletion)
		) {
			return super._updateDiff(key, value, options, state);
		};
	};
};
