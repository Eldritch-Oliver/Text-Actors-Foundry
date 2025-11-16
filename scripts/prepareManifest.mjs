/*
The intent of this script is to do all of the modifications of the
manifest file that we need to do in order to release the system.
This can include removing dev-only fields/attributes that end
users will never, and should never, care about nor need.
*/
import { readFile, writeFile } from "fs/promises";

const MANIFEST_PATH = `system.json`;

const {
	DOWNLOAD_URL,
	LATEST_URL,
} = process.env;

let manifest;
try {
	manifest = JSON.parse(await readFile(MANIFEST_PATH, `utf-8`));
} catch {
	console.error(`Failed to parse manifest file.`);
	process.exit(1);
};


// Filter out dev-only resources
if (manifest.esmodules) {
	manifest.esmodules = manifest.esmodules.filter(
		filepath => !filepath.startsWith(`dev/`)
	);
};

// Remove dev flags
delete manifest.flags?.hotReload;

if (Object.keys(manifest.flags).length === 0) {
	delete manifest.flags;
};

await writeFile(MANIFEST_PATH, JSON.stringify(manifest, undefined, `\t`));
