import { addResponse, has as hasQuery } from "../../utils/QueryManager.mjs";
import { localizer } from "../../utils/localizer.mjs";

export function querySubmit(payload, user) {
	const {
		id,
		answers,
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

	if (!hasQuery(id)) { return };
	addResponse(id, user.id, answers);
};
