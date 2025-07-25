const { Actor } = foundry.documents;

export class TAFActor extends Actor {
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
