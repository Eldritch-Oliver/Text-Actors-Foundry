import { close } from "../../utils/DialogManager.mjs";
import { localizer } from "../../utils/localizer.mjs";

export async function queryCancel(payload) {
	const { id } = payload;

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

	close(id);
};
