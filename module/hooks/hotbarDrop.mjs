const { fromUuidSync } = foundry.utils;

Hooks.on(`hotbarDrop`, (_hotbar, data, _slot) => {
	if (data.type !== `Item`) {return}
	const item = fromUuidSync(data.uuid);
	if (item.inCompendium) {return}
	Object.assign(data, item.system.toHotbarDropData());
});
