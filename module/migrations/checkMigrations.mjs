import { __ID__ } from "../consts.mjs";
import { Logger } from "../utils/Logger.mjs";
import { migrateTo3_0_0 } from "./v3.0.0.mjs";

const { isNewerVersion } = foundry.utils;

export async function checkMigrations() {
	if (!game.user.isActiveGM) {
		Logger.debug(`User not active GM, skipping data migrations`);
		return;
	};

	const migrationVersion = game.settings.get(__ID__, `migrationVersion`);
	let updateVersion = !migrationVersion;

	if (isNewerVersion("3.0.0", migrationVersion)) {
		await migrateTo3_0_0();
		updateVersion = true;
	};

	if (updateVersion) {
		game.settings.set(__ID__, `migrationVersion`, game.system.version);
	};
};
