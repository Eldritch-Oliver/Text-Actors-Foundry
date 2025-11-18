import { createReadStream } from "fs";
import axios from "axios";

const {
	TAG,
	FORGEJO_API_URL: API,
	FORGEJO_REPOSITORY: REPO,
	FORGEJO_TOKEN: TOKEN,
} = process.env;

async function uploadFile(releaseID, localPath, remoteName = undefined) {
	remoteName ??= localPath.split(`/`).at(-1);
	const stream = createReadStream(localPath);
	return axios.post(
		`${API}/repos/${REPO}/releases/${releaseID}/assets`,
		{
			attachment: stream,
		},
		{
			headers: {
				Authorization: `token ${TOKEN}`,
				"Content-Type": `multipart/form-data`,
			},
			params: { name: remoteName },
		}
	)
};

async function main() {

	// Initial Release Data
	const release = await axios.post(
		`${API}/repos/${REPO}/releases`,
		{
			name: TAG,
			tag_name: TAG,
			draft: true,
			hide_archive_links: true,
		},
		{
			headers: { Authorization: `token ${TOKEN}` },
		}
	);

	try {
		await uploadFile(release.data.id, `release.zip`);
		await uploadFile(release.data.id, `system.json`);
	} catch (e) {
		console.error(`Failed to upload files, deleting draft release`);
		console.error(e);

		try {
			await axios.delete(
				`${API}/repos/${REPO}/releases/${release.data.id}`,
				{
					headers: { Authorization: `token ${TOKEN}` },
				}
			)
		} catch {
			console.error(`Failed to delete draft release`);
		};

		process.exit(1);
	};
};

main();
