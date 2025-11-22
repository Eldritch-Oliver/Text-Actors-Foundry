const config = Object.preventExtensions({
	subKeyPattern: /@(?<key>[a-zA-Z.]+)/gm,
	maxDepth: 10,
});

export function localizer(key, args = {}, depth = 0) {
	/** @type {string} */
	let localized = game.i18n.format(key, args);
	const subkeys = localized.matchAll(config.subKeyPattern);

	// Short-cut to help prevent infinite recursion
	if (depth > config.maxDepth) {
		return localized;
	};

	/*
	Helps prevent recursion on the same key so that we aren't doing excess work.
	*/
	const localizedSubkeys = new Map();
	for (const match of subkeys) {
		const subkey = match.groups.key;
		if (localizedSubkeys.has(subkey)) { continue };
		localizedSubkeys.set(subkey, localizer(subkey, args, depth + 1));
	};

	return localized.replace(
		config.subKeyPattern,
		(_fullMatch, subkey) => {
			return localizedSubkeys.get(subkey);
		},
	);
};
