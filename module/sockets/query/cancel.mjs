import { DialogManager } from "../../utils/DialogManager.mjs";

export async function queryCancel(payload) {
	const { id } = payload;

	if (!id) {
		ui.notifications.error(game.i18n.format(
			`taf.notifs.error.malformed-socket-payload`,
			{
				event: `query.cancel`,
				details: `A request ID must be provided`,
			}),
		);
		return;
	};

	await DialogManager.close(id);
};
