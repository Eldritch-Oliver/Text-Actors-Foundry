const { TokenDocument } = foundry.documents;
const { getProperty, getType, hasProperty, isSubclass } = foundry.utils;

export class TAFTokenDocument extends TokenDocument {

	/**
	 * @override
	 * This override's purpose is to make it so that Token attributes and bars can
	 * be accessed from the data model's values directly instead of relying on only
	 * the schema, which doesn't account for my TypedObjectField of attributes.
	 */
	static getTrackedAttributes(data, _path = []) {

		// Case 1 - Infer attributes from schema structure.
		if ( (data instanceof foundry.abstract.DataModel) || isSubclass(data, foundry.abstract.DataModel) ) {
			return this._getTrackedAttributesFromObject(data, _path);
		}
		if ( data instanceof foundry.data.fields.SchemaField ) {
			return this._getTrackedAttributesFromSchema(data, _path);
		}

		// Case 2 - Infer attributes from object structure.
		if ( [`Object`, `Array`].includes(getType(data)) ) {
			return this._getTrackedAttributesFromObject(data, _path);
		}

		// Case 3 - Retrieve explicitly configured attributes.
		if ( !data || (typeof data === `string`) ) {
			const config = this._getConfiguredTrackedAttributes(data);
			if ( config ) {
				return config;
			}
			data = undefined;
		}

		// Track the path and record found attributes
		if ( data !== undefined ) {
			return {bar: [], value: []};
		}

		// Case 4 - Infer attributes from system template.
		const bar = new Set();
		const value = new Set();
		for ( const [type, model] of Object.entries(game.model.Actor) ) {
			const dataModel = CONFIG.Actor.dataModels?.[type];
			const inner = this.getTrackedAttributes(dataModel ?? model, _path);
			inner.bar.forEach(attr => bar.add(attr.join(`.`)));
			inner.value.forEach(attr => value.add(attr.join(`.`)));
		}

		return {
			bar: Array.from(bar).map(attr => attr.split(`.`)),
			value: Array.from(value).map(attr => attr.split(`.`)),
		};
	};

	/**
	 * @override
	 */
	getBarAttribute(barName, {alternative} = {}) {
		const attribute = alternative || this[barName]?.attribute;

		if (!attribute || !this.actor) {
			return null;
		};
		const system = this.actor.system;

		// Get the current attribute value
		const data = getProperty(system, attribute);
		if (data == null) {
			return null;
		};

		if (Number.isNumeric(data)) {
			let editable = hasProperty(system, attribute);
			return {
				type: `value`,
				attribute,
				value: Number(data),
				editable,
			};
		};

		if (`value` in data && `max` in data) {
			let editable = hasProperty(system, `${attribute}.value`);
			const isRange = getProperty(system, `${attribute}.isRange`);
			if (isRange) {
				return {
					type: `bar`,
					attribute,
					value: parseInt(data.value || 0),
					max: parseInt(data.max || 0),
					editable,
				};
			} else {
				return {
					type: `value`,
					attribute: `${attribute}.value`,
					value: Number(data.value),
					editable,
				};
			};
		};

		// Otherwise null
		return null;
	};

};
