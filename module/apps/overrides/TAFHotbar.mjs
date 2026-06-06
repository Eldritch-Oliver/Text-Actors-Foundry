export class TAFHotbar extends foundry.applications.ui.Hotbar {
	async _createRollTableRollMacro(doc) {
		const macro = await super._createRollTableRollMacro(doc);
		const name = _loc(`taf.misc.auto-generated-macros`);
		let folder = game.folders.getName(name);
		folder ??= await foundry.documents.Folder.implementation.create({ name, type: `Macro` });
		await macro.update({ folder: folder.id });
		return macro;
	};

	async _createDocumentSheetToggle(doc) {
		const macro = await super._createDocumentSheetToggle(doc);
		const name = _loc(`taf.misc.auto-generated-macros`);
		let folder = game.folders.getName(name);
		folder ??= await foundry.documents.Folder.implementation.create({ name, type: `Macro` });
		await macro.update({ folder: folder.id });
		return macro;
	};
};
