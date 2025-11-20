import { QueryManager } from "../utils/QueryManager.mjs";

Hooks.on(`userConnected`, (user, connected) => {
	if (user.isSelf) { return };
	QueryManager.userActivity(user.id, connected);
});
