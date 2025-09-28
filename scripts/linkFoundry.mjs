import { existsSync } from "fs";
import { symlink, unlink } from "fs/promises";
import { join } from "path";
import { config } from "dotenv";

config({ quiet: true });

const root = process.env.FOUNDRY_ROOT;

// Early exit
if (!root) {
	console.error(`Must provide a FOUNDRY_ROOT environment variable`);
	process.exit(1);
};

// Assert Foundry exists
if (!existsSync(root)) {
	console.error(`Foundry root not found.`);
	process.exit(1);
};

// Removing existing symlink
if (existsSync(`foundry`)) {
	console.log(`Attempting to unlink foundry instance`);
	try {
		await unlink(`foundry`);
	} catch {
		console.error(`Failed to unlink foundry folder.`);
		process.exit(1);
	};
};

// Account for if the root is pointing at an Electron install
let targetRoot = root;
if (existsSync(join(root, `resources`, `app`))) {
	console.log(`Switching to use the "${root}/resources/app" directory`);
	targetRoot = join(root, `resources`, `app`);
};

// Create symlink
console.log(`Linking foundry source into folder`)
try {
	await symlink(targetRoot, `foundry`);
} catch (e) {
	console.error(e);
	process.exit(1);
};
