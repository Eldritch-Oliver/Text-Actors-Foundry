import axios from "axios";

const {
	TAG,
	FORGEJO_API_URL: API,
	FORGEJO_REPOSITORY: REPO,
	FORGEJO_TOKEN: TOKEN,
	CDN_URL,
} = process.env;

async function addReleaseAsset(releaseID, name) {
	return axios.post(
		`${API}/repos/${REPO}/releases/${releaseID}/assets`,
		{ external_url: `${CDN_URL}/${REPO}/${TAG}/${name}`, },
		{
			headers: {
				Authorization: `token ${TOKEN}`,
				"Content-Type": `multipart/form-data`,
			},
			params: { name },
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
			hide_archive_links: true,
		},
		{
			headers: { Authorization: `token ${TOKEN}` },
		}
	);

	try {
		await addReleaseAsset(release.data.id, `release.zip`);
		await addReleaseAsset(release.data.id, `system.json`);
	} catch (e) {
		console.error(`Failed to add assets to the release`);
		process.exit(1);
	};

	console.log(`Release created`);
};

main();
