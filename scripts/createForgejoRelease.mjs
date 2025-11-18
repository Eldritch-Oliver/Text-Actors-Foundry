import { createReadStream } from "fs";
import axios from "axios";

const {
	TAG,
	FORGEJO_API_URL: API,
	FORGEJO_REPOSITORY: REPO,
	FORGEJO_TOKEN: TOKEN,
} = process.env;

async function main() {

	// Initial Release Data
	const release = await axios.post(
		`${API}/repos/${REPO}/releases`,
		{
			tag_name: TAG,
			draft: true,
			hide_archive_links: true,
		},
		{
			headers: { Authorization: `token ${TOKEN}` },
		}
	);

	// Upload the release archive
	const archive = createReadStream(`release.zip`);
	await axios.post(
		`${API}/repos/${REPO}/releases/${release.data.id}/assets`,
		archive,
		{
			headers: { Authorization: `token ${TOKEN}` },
		}
	);

	// Upload the manifest file
	const manifest = createReadStream(`system.json`);
	await axios.post(
		`${API}/repos/${REPO}/releases/${release.data.id}/assets`,
		manifest,
		{
			headers: { Authorization: `token ${TOKEN}`, },
		}
	);
};

main();
