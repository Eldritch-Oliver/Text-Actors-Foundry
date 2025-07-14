import { filePath } from "../../consts.mjs";

/**
 * @param {HTMLElement} Base
 */
export function StyledShadowElement(Base) {
	return class extends Base {
		/**
		 * The path to the CSS that is loaded
		 * @type {string}
		 */
		static _stylePath;

		/**
		 * The stringified CSS to use
		 * @type {Map<string, string>}
		 */
		static _styles = new Map();

		/**
		 * The HTML element of the stylesheet
		 * @type {HTMLStyleElement}
		 */
		_style;

		/** @type {ShadowRoot} */
		_shadow;

		constructor() {
			super();

			this._shadow = this.attachShadow({ mode: `open` });
			this._style = document.createElement(`style`);
			this._shadow.appendChild(this._style);
		};

		#mounted = false;
		connectedCallback() {
			if (this.#mounted) { return };

			this._getStyles();

			this.#mounted = true;
		};

		disconnectedCallback() {
			if (!this.#mounted) { return };
			this.#mounted = false;
		};

		_getStyles() {
			// TODO: Cache the CSS content in a more sane way that doesn't break
			const stylePath = this.constructor._stylePath;
			if (this.constructor._styles.has(stylePath)) {
				this._style.innerHTML = this.constructor._styles.get(stylePath);
			} else {
				fetch(filePath(`styles/components/${stylePath}`))
					.then(r => r.text())
					.then(t => {
						this.constructor._styles.set(stylePath, t);
						this._style.innerHTML = t;
					});
			}
		};
	};
};
