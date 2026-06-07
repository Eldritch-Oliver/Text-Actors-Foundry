/**
 * This is a helper class that acts similar to an Array, that keeps the items
 * in a sorted order upon insertion. This does NOT prevent breaking the sort order
 * by direct mutations, splices, or any other array-modifying methods. It only
 * maintains the sort order when using the push method.
 */
export class SortedArray extends Array {
	push(...items) {
		for (const item of items) {
			if (typeof item.sort !== `number`) {
				throw `Sort property on items added to a sorted array must be either null or a number`;
			};

			if (this.length === 0) {
				super.push(item);
				continue;
			};

			// sort item first
			if (item.sort < (this.at(0)?.sort ?? Number.NEGATIVE_INFINITY)) {
				super.splice(0, 0, item);
			}

			// sort item last
			else if (item.sort >= (this.at(-1)?.sort ?? Number.POSITIVE_INFINITY)) {
				super.push(item);
			}

			// sort somewhere in the middle
			else {
				for (let i = 1; i <= this.length; i++) {
					const before = this.at(i - 1).sort ?? Number.NEGATIVE_INFINITY;
					const after = this.at(i)?.sort ?? Number.POSITIVE_INFINITY;
					if (before <= item.sort && item.sort < after) {
						super.splice(i, 0, item);
						break;
					};
				};
			};
		};
	};
};
