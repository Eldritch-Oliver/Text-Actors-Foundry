import { userActivity } from "../utils/QueryManager.mjs";

Hooks.on(`userConnected`, (user, connected) => {
	if (user.isSelf) { return };
	userActivity(user.id, connected);
});
