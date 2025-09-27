import { config } from "dotenv";
config();

console.log(process.env)
const root = process.env.FOUNDRY_ROOT;

// Early exit
if (!root) { process.exit(1) };

// Assert root exists
