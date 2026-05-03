export class TAFMacro extends foundry.documents.Macro {
	async deleteDialog(options, operation) {
		const itemsUsingMacro = new Set();

		// Check Items on Actors
		game.actors.forEach(actor => {
			actor.items.forEach(item => {
				console.log(item.uuid, `owned by`, actor.uuid);
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

		options.content = content;
		return super.deleteDialog(options, operation);
	};
};
