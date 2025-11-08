import { DialogManager } from "../utils/DialogManager.mjs";

export async function dataRequest(payload) {
	const {
		id,
		users,
		config,
		request,
	} = payload;

	if (!id) {
		ui.notifications.error(game.i18n.format(
			`taf.notifs.error.malformed-socket-payload`,
			{
				event: `query.prompt`,
				details: `A request ID must be provided`,
			}),
		);
		return;
	};

	// null/undefined is a special case for "all users but me" by default
	if (!Array.isArray(users) || users != null) {
		ui.notifications.error(game.i18n.format(
			`taf.notifs.error.malformed-socket-payload`,
			{
				event: `query.prompt`,
				details: ``,
			}),
		);
		return;
	};

	if (!users.includes(game.user.id)) { return };

	request.id = id;
	const result = await DialogManager.ask(request, config);
	if (result.state === `fronted`) { return };
	if (result.state === `errored`) {
		ui.notifications.error(result.error);
		return;
	};


};
