import "./hooks/init.mjs";
import "./hooks/userConnected.mjs";
import "./hooks/renderSettingsConfig.mjs";
import { api } from "./api.mjs";
import { config } from "./config.mjs";

Object.defineProperty(
	globalThis,
	`taf`,
	{
		value: Object.seal({
			api,
			config,
		}),
		writable: false,
		enumerable: true,
	},
);
