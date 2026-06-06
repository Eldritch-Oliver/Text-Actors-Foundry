import { __ID__ } from "../consts.mjs";

const { getProperty } = foundry.utils;

export class TAFMacro extends foundry.documents.Macro {
	async deleteDialog(options, operation) {
		const itemsUsingMacro = new Set();

		// Check Items on Actors
		game.actors.forEach(actor => {
			actor.items.forEach(item => {
				if (item.system.trigger === this.uuid) {
					itemsUsingMacro.add(item.uuid);
				};
			});
		});

		// Check World Items
		game.items.forEach(item => {
			if (item.system.trigger === this.uuid) {
				itemsUsingMacro.add(item.uuid);
			};
		});

		// Modify the dialog arguments
		const type = _loc(this.constructor.metadata.label);
		const question = _loc(`COMMON.AreYouSure`);
		const warning = _loc(`SIDEBAR.DeleteWarning`, { type });
		let content = `<p style="margin: 0;"><strong>${question}</strong> ${warning}</p>`;

		if (itemsUsingMacro.size) {
			const extraInfo = _loc(
				`taf.misc.macro-is-in-use`,
				{ count: itemsUsingMacro.size },
			);
			content += `<p style="margin: 0;">${extraInfo}</p>`;
		};

		options ??= {};
		options.content = content;
		return super.deleteDialog(options, operation);
	};

	async _preCreate(data, options, user) {
		if (getProperty(data, `flags.${__ID__}.createdForHotbar`)) {
			const name = _loc(`taf.misc.auto-generated-macros`);
			let folder = game.folders.getName(name);
			folder ??= await Folder.create({ name, type: `Macro` });
			const update = { folder: folder.id };

			// Remove with issue: Foundry/taf#54
			// v13/v14+ compatibility shim
			if (game.release.generation > 13) {
				update[`flags.${__ID__}.createdForHotbar`] = _del;
			} else {
				update[`flags.${__ID__}.-=createdForHotbar`] = null;
			};

			this.updateSource(update);
		};
		return super._preCreate(data, options, user);
	};
};
