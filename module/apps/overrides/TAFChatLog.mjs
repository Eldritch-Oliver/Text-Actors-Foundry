import { config } from "../../config.mjs";

const { ChatLog } = foundry.applications.sidebar.tabs;
const { fromUuid } = foundry.utils;

export class TAFChatLog extends ChatLog {
	// #region Options
	static DEFAULT_OPTIONS = {
		actions: {
			tafChatAction: this.#chatButtonClick,
		},
	};
	// #endregion Options

	// #region Actions
	static async #chatButtonClick(event, target) {
		const msgID = target.closest(`[data-message-id]`)?.dataset.messageId;
		const chatActionID = target.dataset.chatActionId;
		if (!msgID || !chatActionID) return;

		const msg = game.messages.get(msgID);
		const btn = msg?.system.buttons?.find(b => b.id === chatActionID);
		if (!msg || !btn) return;

		// Execute the chat action
		if (btn.callback in config.chatActions) {
			await config.chatActions[btn.callback]?.(message, ...btn.args);
		} else {
			const macro = await fromUuid(btn.callback);
			if (!macro) {
				ui.notifications.error(_loc(`taf.notifs.error.missing-macro`, { uuid: btn.callback }));
				return;
			};

			await macro?.execute({
				message: msg,
				args: btn.args,
				speaker: msg.speaker,
			});
		}
	};
	// #endregion Actions
};
