import { TafSVGLoader } from "./svgLoader.mjs";

/**
Attributes:
@property {string} name - The name of the icon, takes precedence over the path
@property {string} path - The path of the icon file
*/
export class TafIcon extends TafSVGLoader {
	static elementName = `taf-icon`;
	static _stylePath = `icon.css`;
};
