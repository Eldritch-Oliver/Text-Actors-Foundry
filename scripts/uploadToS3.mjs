import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { createReadStream } from "fs";

const requiredEnvVariables = [
	`TAG`, `FILE`,
	`FORGEJO_REPOSITORY`,
	`S3_BUCKET`, `S3_REGION`, `S3_KEY`, `S3_SECRET`, `S3_ENDPOINT`,
];

async function main() {

	// Assert all of the required env variables are present
	const missing = [];
	for (const envVar of requiredEnvVariables) {
		if (!(envVar in process.env)) {
			missing.push(envVar);
		};
	};
	if (missing.length > 0) {
		console.error(`Missing the following required environment variables: ${missing.join(`, `)}`);
		process.exit(1);
	};

	const {
		TAG,
		S3_ENDPOINT,
		S3_REGION,
		S3_KEY,
		S3_SECRET,
		S3_BUCKET,
		FILE,
		FORGEJO_REPOSITORY: REPO,
	} = process.env;

	const s3Client = new S3Client({
		endpoint: S3_ENDPOINT,
		forcePathStyle: false,
		region: S3_REGION,
		credentials: {
			accessKeyId: S3_KEY,
			secretAccessKey: S3_SECRET
		},
	});

	const name = FILE.split(`/`).at(-1);

	const params = {
		Bucket: S3_BUCKET,
		Key: `${REPO}/${TAG}/${name}`,
		Body: createReadStream(FILE),
		ACL: "public-read",
		METADATA: {
			"x-repo-version": TAG,
		},
	};

	try {
		const response = await s3Client.send(new PutObjectCommand(params));
		console.log("Upload successful");
	} catch (err) {
		console.error("Upload to s3 failed");
	};
};

main();
