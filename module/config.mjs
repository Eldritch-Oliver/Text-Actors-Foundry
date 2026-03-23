import { formatWeight } from "./utils/formatWeight.mjs";

const { deepSeal } = foundry.utils;

export const config = CONFIG.TAF = deepSeal({
	weightFormatter: formatWeight,
});
