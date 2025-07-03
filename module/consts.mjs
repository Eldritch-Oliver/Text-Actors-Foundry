export const __ID__ = `taf`;

// MARK: filePath
export function filePath(path) {
	if (path.startsWith(`/`)) {
		path = path.slice(1);
	};
	return `systems/${__ID__}/${path}`;
};
