import { __ID__, filePath } from "../consts.mjs";
import { Logger } from "./Logger.mjs";

const { ChatMessage } = foundry.documents;
const { renderTemplate } = foundry.applications.handlebars;
const { fetchJsonWithTimeout, isNewerVersion } = foundry.utils;

let newestVersion = null;

async function fetchLatestVersion() {
	const includeBetas = game.settings.get(__ID__, `betaChannel`);
	try {
		const releases = await fetchJsonWithTimeout(`https://git.varify.ca/api/v1/repos/Foundry/taf/releases?pre-release=${includeBetas}&limit=1`);
		return releases.at(0);
	} catch {
		Logger.error(`Failed to fetch latest version from Forgejo, halting version checks`);
		return;
	};
};

export async function getLatestVersion() {
	if (!newestVersion) {
		newestVersion = await fetchLatestVersion();
	};
	return newestVersion;
};

export async function checkForNewReleases() {
	// Only perform the update check if the game is ready and the user is the active GM
	if (!game.user.isActiveGM || !game.ready) { return };

	// Don't do any version notifications if this is a fresh world
	const lastNotifiedVersion = game.settings.get(__ID__, `lastUpdateNotified`);
	if (!lastNotifiedVersion) {
		game.settings.set(__ID__, `lastUpdateNotified`, game.system.version);
		return;
	};
	let latest = newestVersion = await getLatestVersion();

	// Is the latest release newer than the previously notified release
	const latestVersion = latest.tag_name.replace(/^v/, ``);
	if (!isNewerVersion(latestVersion, lastNotifiedVersion)) { return };

	const content = await renderTemplate(
		filePath(`templates/new-version-message.hbs`),
		{
			release: latest,
			system: game.system,
		},
	);
	ChatMessage.implementation.create({
		whisper: [ game.user.id ],
		content,
	});

	// Mark the new version as the
	game.settings.set(__ID__, `lastUpdateNotified`, latestVersion);
};

export function registerReleaseSettings() {
	game.settings.register(__ID__, `betaChannel`, {
		name: `${__ID__}.settings.betaChannel.name`,
		hint: `${__ID__}.settings.betaChannel.hint`,
		config: true,
		type: Boolean,
		default: false,
		scope: `world`,
	});

	game.settings.register(__ID__, `lastUpdateNotified`, {
		config: false,
		type: String,
		scope: `world`,
	});
};
