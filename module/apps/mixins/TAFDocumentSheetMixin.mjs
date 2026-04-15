import { updateForeignDocumentFromEvent } from "../utils.mjs";

const { hasProperty } = foundry.utils;

export function TAFDocumentSheetMixin(HandlebarsApplication) {
	class TAFDocumentSheet extends HandlebarsApplication {
		/** @type {Record<string, string[]> | null} */
		static PROPERTY_TO_PARTIAL = null;

		// #region Lifecycle
		/**
		 * This override is used by the mixin in order to allow for partial
		 * re-rendering of applications based on what properties changed.
		 * It requires that a static PROPERTY_TO_PARTIAL to be defined as
		 * an object of path keys to arrays of part IDs in order to work.
		 * This will not interfere with renders that are not started as
		 * part of the actor update lifecycle.
		 */
		_configureRenderOptions(options) {

			if (options.renderContext === `updateActor`) {
				const propertyToParts = this.constructor.PROPERTY_TO_PARTIAL;
				if (propertyToParts) {
					const parts = new Set();
					for (const property in propertyToParts) {
						if (hasProperty(options.renderData, property)) {
							propertyToParts[property].forEach(partID => parts.add(partID));
						};
					};
					options.parts = options.parts?.filter(part => !parts.has(part)) ?? Array.from(parts);
				}
			};

			super._configureRenderOptions(options);
		};

		async _onRender(...args) {
			await super._onRender(...args);
			this._attachEmbeddedChangeListeners();
		};

		_attachEmbeddedChangeListeners() {
			/** @type {HTMLElement[]} */
			const elements = this.element.querySelectorAll(`[data-foreign-name]`);
			for (const el of elements) {
				el.addEventListener(`change`, updateForeignDocumentFromEvent);
			};
		};
		// #endregion Lifecycle
	};

	return TAFDocumentSheet;
};
