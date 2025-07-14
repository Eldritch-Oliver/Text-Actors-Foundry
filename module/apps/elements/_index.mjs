import { Logger } from "../../utils/Logger.mjs";
import { TafIcon } from "./Icon.mjs";
import { TafSVGLoader } from "./svgLoader.mjs";

const components = [
	TafSVGLoader,
	TafIcon,
];

export function registerCustomComponents() {
	(CONFIG.CACHE ??= {}).componentListeners ??= [];
	for (const component of components) {
		if (!window.customElements.get(component.elementName)) {
			Logger.debug(`Registering component "${component.elementName}"`);
			window.customElements.define(
				component.elementName,
				component,
			);
			if (component.formAssociated) {
				CONFIG.CACHE.componentListeners.push(component.elementName);
			}
		};
	}
};
