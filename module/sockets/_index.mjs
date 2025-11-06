import { cancelRequest } from "./cancelRequest.mjs";
import { createNotif } from "./createNotif.mjs";
import { dataRequest } from "./dataRequest.mjs";
import { localizer } from "../utils/Localizer.mjs";
import { Logger } from "../utils/Logger.mjs";
import { submitRequest } from "./submitRequest.mjs";

const events = {
	// Data Request sockets
	cancelRequest,
	createNotif,
	dataRequest,
	submitRequest,
};

export function registerSockets() {
	Logger.info(`Setting up socket listener`);

	game.socket.on(`system.taf`, (data, userID) => {
		const { event, payload } = data ?? {};
		if (event == null || payload === undefined) {
			ui.notifications.error(localizer(`taf.notifs.error.invalid-socket`));
			return;
		};

		if (events[event] == null) {
			ui.notifications.error(localizer(`taf.notifs.error.unknown-socket-event`, { event }));
			return;
		};

		const user = game.users.get(userID);
		events[event](payload, user);
	});
};
