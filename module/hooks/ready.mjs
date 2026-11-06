import { checkForNewReleases } from "../utils/ReleaseChannels.mjs";
import { checkMigrations } from "../migrations/checkMigrations.mjs";

Hooks.on(`ready`, () => {
	checkMigrations();
	checkForNewReleases();
});
