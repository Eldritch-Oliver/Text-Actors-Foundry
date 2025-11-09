export function createNotif(payload) {
	const { userID, content, includeGM } = payload;

	if (userID !== game.user.id) { return };

	// TODO: prevent this from working if the user hasn't submitted a query response

	let whisper = [game.user.id];
	if (includeGM) {
		whisper = game.users.filter(u => u.isGM).map(u => u.id);
	};

	ChatMessage.implementation.create({
		flavor: `Data Query Notification`,
		content,
		whisper,
		style: CONST.CHAT_MESSAGE_STYLES.OOC,
	});
};
