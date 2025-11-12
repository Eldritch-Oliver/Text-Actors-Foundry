import { QueryManager } from "../utils/QueryManager.mjs";

Hooks.on(`userConnected`, (user) => {
	QueryManager.userActivity(user.id);
});
