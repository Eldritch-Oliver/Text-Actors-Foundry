import { checkMigrations } from "../migrations/checkMigrations.mjs";

Hooks.on(`ready`, () => {
	// Remove with issue: Foundry/taf#52
	if (game.release.generation < 14 && globalThis._loc == null) {
		globalThis._loc = game.i18n.format.bind(game.i18n);
	};

	checkMigrations();
});
