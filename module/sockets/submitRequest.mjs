import { addResponse, has as hasQuery } from "../utils/QueryManager.mjs";

export function submitRequest(payload, user) {
	const {
		id,
		answers,
	} = payload;

	if (!id) {
		ui.notifications.error(game.i18n.format(
			`taf.notifs.error.malformed-socket-payload`,
			{
				event: `query.submit`,
				details: `A request ID must be provided`,
			}),
		);
		return;
	};

	if (!hasQuery(id)) { return };
	addResponse(id, user.id, answers);
};
