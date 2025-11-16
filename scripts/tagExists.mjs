import axios from "axios";

const {
	TAG_NAME,
	FORGEJO_API_URL: API_URL,
	FORGEJO_REPOSITORY: REPO,
	FORGEJO_TOKEN: TOKEN,
} = process.env;

async function main() {
	const requestURL = `${API_URL}/repos/${REPO}/tags/${TAG_NAME}`;

	const response = await axios.get(
		requestURL,
		{
			headers: { Authorization: `token ${TOKEN}` },
			validateStatus: () => true,
		},
	);

	// We actually *want* an error when the tag exists, instead of when
	// it doesn't
	if (response.status === 200) {
		process.exit(1);
	};
};

main();
