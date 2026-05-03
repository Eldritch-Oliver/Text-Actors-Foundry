import { toPrecision } from "../../utils/roundToPrecision.mjs";

export class GenericItemData extends foundry.abstract.TypeDataModel {
	// MARK: Schema
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			group: new fields.StringField({
				blank: false,
				trim: true,
				initial: null,
				nullable: true,
			}),
			weight: new fields.NumberField({
				min: 0,
				initial: 0,
				nullable: false,
			}),
			quantity: new fields.NumberField({
				integer: true,
				initial: 1,
			}),
			equipped: new fields.BooleanField({
				initial: true,
			}),
			trigger: new fields.DocumentUUIDField({
				embedded: false,
				relative: false,
				type: foundry.documents.Macro.documentName,
			}),
			description: new fields.HTMLField({
				blank: true,
				trim: true,
				initial: ``,
			}),
		};
	};

	// #region Methods
	/**
	 * Calculates the total weight of the item based on the quantity of it, this
	 * rounds the number to the nearest 2 decimal places.
	 */
	get quantifiedWeight() {
		const value = this.weight * this.quantity;
		return toPrecision(Math.max(value, 0), 2);
	};

	/**
	 * Executes the macro associated with this item, if the macro cannot be
	 * found or if the user does not permission to execute it, it will not be
	 * executed. This also provides some extra context into the roll data for chat
	 * macros, so that they can refer to some properties of this specific item
	 * without actually needing to know which item called the macro.
	 */
	async execute() {
		const macro = await fromUuid(this.trigger);
		if (!macro || !macro.canExecute) { return };

		// Provide the chat-specific context when required
		if (macro.type === `chat`) {
			const extraContext = {
				name: this.parent.name,
				quantity: this.quantity,
				equipped: this.equipped ? 1 : 0,
			};

			Hooks.once(`taf.getRollData`, (data) => {
				data.active = extraContext;
			});

			// Apply any roll data additions to the message flavour as well
			// since that doesn't get formatted by the ChatLog
			Hooks.once(`preCreateChatMessage`, (message) => {
				if (message.flavor.includes(`@active`)) {
					const flavor = message.flavor.replaceAll(
						/@active\.(\w+)/g,
						(fullMatch, key) => {
							return extraContext[key] || fullMatch;
						},
					);
					message.updateSource({ flavor });
				};
			});
		};

		// Get the speaker so that Foundry has the correct context to be able to call
		// the Actor's getData method, letting us augment the context dynamically for
		// the @active roll context
		const speaker = foundry.documents.ChatMessage.implementation.getSpeaker({
			actor: this.parent.parent
		});

		await macro?.execute({ item: this.parent });
	};
	// #endregion Methods
};
