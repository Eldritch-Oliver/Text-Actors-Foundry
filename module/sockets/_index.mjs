import { Logger } from "../utils/Logger.mjs";
import { queryCancel } from "./query/cancel.mjs";
import { queryNotify } from "./query/notify.mjs";
import { queryPrompt } from "./query/prompt.mjs";
import { querySubmit } from "./query/submit.mjs";

const events = {
	// Data Request sockets
	"query.cancel": queryCancel,
	"query.notify": queryNotify,
	"query.prompt": queryPrompt,
	"query.submit": querySubmit,
};

export function registerSockets() {
	Logger.info(`Setting up socket listener`);

	game.socket.on(`system.taf`, (data, userID) => {
		const { event, payload } = data ?? {};
		if (event == null || payload === undefined) {
			ui.notifications.error(game.i18n.format(`taf.notifs.error.invalid-socket`));
			return;
		};

		if (events[event] == null) {
			ui.notifications.error(game.i18n.format(`taf.notifs.error.unknown-socket-event`, { event }));
			return;
		};

		const user = game.users.get(userID);
		events[event](payload, user);
	});
};
