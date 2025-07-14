import { filePath } from "../../consts.mjs";
import { Logger } from "../../utils/Logger.mjs";
import { StyledShadowElement } from "./StyledShadowElement.mjs";

/**
Attributes:
@property {string} name - The name of the icon, takes precedence over the path
@property {string} path - The path of the icon file
*/
export class TafSVGLoader extends StyledShadowElement(HTMLElement) {
	static elementName = `taf-svg`;
	static formAssociated = false;

	/* Stuff for the mixin to use */
	static _stylePath = `svg-loader.css`;


	static _cache = new Map();
	#container;
	/** @type {null | string} */
	_name;
	/** @type {null | string} */
	_path;

	constructor() {
		super();

		this.#container = document.createElement(`div`);
		this._shadow.appendChild(this.#container);
	};

	_mounted = false;
	async connectedCallback() {
		super.connectedCallback();
		if (this._mounted) { return };

		this._name = this.getAttribute(`name`);
		this._path = this.getAttribute(`path`);

		/*
		This converts all of the double-dash prefixed properties on the element to
		CSS variables so that they don't all need to be provided by doing style=""
		*/
		for (const attrVar of this.attributes) {
			if (attrVar.name?.startsWith(`var:`)) {
				const prop = attrVar.name.replace(`var:`, ``);
				this.style.setProperty(`--` + prop, attrVar.value);
			};
		};

		/*
		Try to retrieve the icon if it isn't present, try the path then default to
		the slot content, as then we can have a default per-icon usage
		*/
		let content;
		if (this._name) {
			content = await this.#getIcon(filePath(`assets/${this._name}.svg`));
		};

		if (this._path && !content) {
			content = await this.#getIcon(this._path);
		};

		if (content) {
			this.#container.appendChild(content.cloneNode(true));
		};

		this._mounted = true;
	};

	disconnectedCallback() {
		super.disconnectedCallback();
		if (!this._mounted) { return };

		this._mounted = false;
	};

	async #getIcon(path) {
		// Cache hit!
		if (this.constructor._cache.has(path)) {
			Logger.debug(`Image ${path} cache hit`);
			return this.constructor._cache.get(path);
		};

		const r = await fetch(path);
		switch (r.status) {
			case 200:
			case 201:
				break;
			default:
				Logger.error(`Failed to fetch icon: ${path}`);
				return;
		};

		Logger.debug(`Adding image ${path} to the cache`);
		const svg = this.#parseSVG(await r.text());
		this.constructor._cache.set(path, svg);
		return svg;
	};

	/** Takes an SVG string and returns it as a DOM node */
	#parseSVG(content) {
		const temp = document.createElement(`div`);
		temp.innerHTML = content;
		return temp.querySelector(`svg`);
	};
};
