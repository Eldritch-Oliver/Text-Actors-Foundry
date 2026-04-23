export function clamp(min, ideal, max) {
	min ??= Number.NEGATIVE_INFINITY;
	max ??= Number.POSITIVE_INFINITY;
	return Math.max(min, Math.min(ideal, max));
};
