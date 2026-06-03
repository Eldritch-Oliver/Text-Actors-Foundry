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

		/**
		 * @override
		 * Disable or reenable all form fields in this application.
		 *
		 * This override is to make is to make it so that elements only get disabled
		 * if it:
		 *   - has no indicated permission level
		 *   - the user does not have the required permission level indicated
		 *
		 * @param {boolean} disabled Should the fields be disabled?
		 * @protected
		 */
		_toggleDisabled(disabled) {
			const form = this.form;
			if (!this.form) return;
			const framed = this.options.window.frame;
			for (const element of form.elements) {

				// override: This is the only section that I added
				const { requiredPermission } = element.dataset ?? {};
				const requiredLevel = CONST.DOCUMENT_OWNERSHIP_LEVELS[requiredPermission]
					?? CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER;
				if (requiredLevel <= this.document.permission) {
					continue;
				};
				// end override

				if (!framed || element.closest(".window-content")) {
					element.disabled = disabled;
				};
			};
			const contentEl = framed ? form.querySelector(".window-content") : form;
			for (const input of contentEl.querySelectorAll("input[type=image]") ) {
				input.disabled = disabled; // By specification, these are not included in a HTMLFormControlsCollection
			};
			for (const img of contentEl.querySelectorAll("img[data-edit]")) {
				img.classList.toggle("disabled", disabled);
			};
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
