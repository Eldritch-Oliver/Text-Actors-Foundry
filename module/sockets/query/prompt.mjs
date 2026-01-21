import { ask } from "../../utils/DialogManager.mjs";
import { localizer } from "../../utils/localizer.mjs";
import { respondedToQueries } from "../../utils/QueryManager.mjs";

export async function queryPrompt(payload) {
	const {
		id,
		users,
		config,
		request,
	} = payload;

	if (!id) {
		ui.notifications.error(localizer(
			`taf.notifs.error.malformed-socket-payload`,
			{
				event: `query.cancel`,
				details: `taf.notifs.error.missing-id`,
			},
		));
		return;
	};

	// null/undefined is a special case for "all users but me" by default
	if (users != null && !Array.isArray(users)) {
		ui.notifications.error(localizer(
			`taf.notifs.error.malformed-socket-payload`,
			{
				event: `query.cancel`,
				details: `taf.sockets.user-list-required`,
			},
		));
		return;
	};

	if (users != null && !users.includes(game.user.id)) { return };

	request.id = id;
	const result = await ask(request, config);
	if (result.state === `fronted`) {
		return;
	} else if (result.state === `errored`) {
		ui.notifications.error(result.error);
	} else if (result.state === `prompted`) {
		respondedToQueries.add(request.id);
		game.socket.emit(`system.taf`, {
			event: `query.submit`,
			payload: {
				id: request.id,
				answers: result.answers,
			},
		});
	};
};
