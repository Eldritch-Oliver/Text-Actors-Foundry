import { formatWeight } from "./utils/formatWeight.mjs";

const { deepSeal } = foundry.utils;

export const config = deepSeal({
	weightFormatter: formatWeight,
});
