import { localizer } from "../../utils/localizer.mjs";
import { respondedToQueries } from "../../utils/QueryManager.mjs";

export function queryNotify(payload) {
	const { id, userID, content, includeGM } = payload;

	if (userID !== game.user.id) { return };

	// Ensure that each user can only get one notification about a query
	if (!respondedToQueries.has(id)) { return };

	let whisper = [game.user.id];
	if (includeGM) {
		whisper = game.users.filter(u => u.isGM).map(u => u.id);
	};

	ChatMessage.implementation.create({
		flavor: localizer(`taf.misc.data-query-notif-header`),
		content,
		whisper,
		style: CONST.CHAT_MESSAGE_STYLES.OOC,
	});

	respondedToQueries.delete(id);
};
