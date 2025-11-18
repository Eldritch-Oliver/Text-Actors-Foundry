/*
Create draft release
Assert HTTP 200
Upload release.zip
Upload system.json
*/
import { createReadStream } from "fs";
import axios from "axios";

const {
	TAG,
	REPO,
	TOKEN,
	API_URL: API,
} = process.env;

async function uploadFile(uploadsURL, localPath, remoteName = undefined) {
	remoteName ??= localPath.split(`/`).at(-1);
	const stream = createReadStream(localPath);
	return axios.post(
		uploadsURL,
		{
			attachment: stream,
		},
		{
			headers: {
				Authorization: `Bearer ${TOKEN}`,
				"Content-Type": `multipart/form-data`,
				"X-GitHub-Api-Version": `2022-11-28`,
			},
			params: { name: remoteName },
		}
	);
};

async function main() {

	// Initial Release Data
	const release = await axios.post(
		`${API}/repos/${REPO}/releases`,
		{
			name: TAG,
			tag_name: TAG,
			draft: true,
			generate_release_notes: false,
			make_latest: "false",
		},
		{
			headers: {
				Authorization: `Bearer ${TOKEN}`,
				"X-GitHub-Api-Version": `2022-11-28`,
			},
		}
	);

	try {
		await uploadFile(release.data.upload_url, `release.zip`);
		await uploadFile(release.data.upload_url, `system.json`);
	} catch (e) {
		console.error(`Failed to upload files, deleting draft release`);
		console.error(e);

		try {
			await axios.delete(
				`${API}/repos/${REPO}/releases/${release.data.id}`,
				{
					headers: {
						Authorization: `Bearer ${TOKEN}`,
						"X-GitHub-Api-Version": `2022-11-28`,
					},
				}
			)
		} catch {
			console.error(`Failed to delete draft release`);
		};

		process.exit(1);
	};

	console.log(`Release created, and files uploaded successfully!`);
};

main();
