const { randomID, getType } = foundry.utils;

export class BaseChatMessageData extends foundry.abstract.TypeDataModel {
	// MARK: Schema
	static defineSchema() {
		const fields = foundry.data.fields;

		const buttonData = new fields.SchemaField({
			id: new fields.StringField({ blank: false, nullable: false }),
			label: new fields.StringField({ blank: false, nullable: false }),
			width: new fields.NumberField({ initial: 2, choices: [1, 2] }),
			callback: new fields.StringField({ required: true, blank: false, nullable: false }),
			args: new fields.ArrayField(new fields.AnyField()),
			visibility: new fields.StringField({
				blank: false,
				required: false,
				initial: `private`,
				choices: [
					`blind`, // Only the GM-ranked users can see
					`gm`, // All GM-ranked users, and the AUTHOR can see
					`self`, // Only the chat message AUTHOR can see
					`public`, // All users can see
				],
			}),
		});

		return {
			buttons: new fields.ArrayField(buttonData, { nullable: true, initial: null }),
		};
	};

	// #region Lifecycle
	async _preCreate() {
		if (getType(this.buttons) === `Array`) {
			const btns = this.buttons;
			for (const btn of btns) {
				btn.id = randomID();
			};
			this.updateSource({ buttons: btns });
		};
	};
	// #endregion Lifecycle

	// #region Methods
	get visibleButtons() {
		const msg = this.parent;
		return this.buttons?.filter(btn => {
			const isGM = game.user.isGM;
			switch (btn.visibility) {
				case `gm`: return msg.isAuthor || isGM;
				case `self`: return msg.isAuthor;
				case `blind`: return isGM;
				default: return true;
			};
		});
	};
	// #endregion Methods
};
