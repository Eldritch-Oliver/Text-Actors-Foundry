export function attributeSorter(a, b) {
	if (a.sort === b.sort) {
		return a.name.localeCompare(b.name);
	};
	return Math.sign(a.sort - b.sort);
};
