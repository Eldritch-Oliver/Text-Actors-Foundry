import { openAsBlob } from "node:fs";
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
	const archiveFormData = new FormData();
	const archive = await openAsBlob(`release.zip`);
	archiveFormData.set(`release`, archive, `release.zip`)
	await axios.post(
		`${API}/repos/${REPO}/releases/${release.data.id}/assets`,
		archiveFormData,
		{
			headers: { Authorization: `token ${TOKEN}` },
		}
	);

	// Upload the manifest file
	const formData = new FormData();
	const manifest = await openAsBlob(`system.json`);
	formData.set(`manifest`, manifest, `system.json`)
	await axios.post(
		`${API}/repos/${REPO}/releases/${release.data.id}/assets`,
		formData,
		{
			headers: { Authorization: `token ${TOKEN}` },
		}
	);
};

main();
