import { __ID__, filePath } from "../consts.mjs";
import { getDefaultSizing } from "../utils/getSizing.mjs";
import { localizer } from "../utils/localizer.mjs";

const { diffObject, expandObject, flattenObject } = foundry.utils;
const { DocumentSheetConfig } = foundry.applications.apps;
const { CONST } = foundry;

export class TAFDocumentSheetConfig extends DocumentSheetConfig {

	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [`taf`],
		form: {
			handler: this.#onSubmit,
		},
	};

	static get PARTS() {
		const { form, footer } = super.PARTS;
		return {
			tabs: { template: `templates/generic/tab-navigation.hbs` },
			foundryTab: {
				...form,
				template: filePath(`templates/TAFDocumentSheetConfig/foundry.hbs`),
				templates: [ `templates/sheets/document-sheet-config.hbs` ],
			},
			systemTab: {
				template: filePath(`templates/TAFDocumentSheetConfig/system.hbs`),
				classes: [`standard-form`],
			},
			footer,
		};
	};

	static TABS = {
		main: {
			initial: `system`,
			labelPrefix: `taf.Apps.TAFDocumentSheetConfig.tabs`,
			tabs: [
				{ id: `system` },
				{ id: `foundry` },
			],
		},
	};
	// #endregion Options

	// #region Data Prep
	async _preparePartContext(partID, context, options) {
		this._prepareTabs(`main`);

		context.meta = {
			idp: this.id,
		};

		switch (partID) {
			case `foundryTab`: {
				await this._prepareFormContext(context, options);
				break;
			};
			case `systemTab`: {
				await this._prepareSystemSettingsContext(context, options);
				break;
			};
			case `footer`: {
				await this._prepareFooterContext(context, options);
				break;
			};
		};
		return context;
	};

	async _prepareSystemSettingsContext(context, _options) {
		// Inherited values for placeholders
		const defaults = getDefaultSizing();
		context.placeholders = {
			...defaults,
			resizable: defaults.resizable
				? localizer(`taf.misc.resizable`)
				: localizer(`taf.misc.not-resizable`),
		};

		// Custom values from document itself
		const sheetConfig = this.document.getFlag(__ID__, `PlayerSheet`) ?? {};
		const sizing = sheetConfig.size ?? {};
		context.values = {
			width: sizing.width,
			height: sizing.height,
			resizable: sizing.resizable ?? ``,
		};

		// Static prep
		context.resizeOptions = [
			{
				label: localizer(
					`taf.Apps.TAFDocumentSheetConfig.Resizable.placeholder`,
					{ placeholder: context.placeholders.resizable },
				),
				value: ``,
			},
			{ label: localizer(`taf.misc.resizable`), value: `true` },
			{ label: localizer(`taf.misc.not-resizable`), value: `false` },
		];
	};
	// #endregion Data Prep

	// #region Actions
	/** @this {TAFDocumentSheetConfig} */
	static async #onSubmit(event, form, formData) {
		const foundryReopen = await TAFDocumentSheetConfig.#submitFoundry.call(this, event, form, formData);
		const systemReopen = await TAFDocumentSheetConfig.#submitSystem.call(this, event, form, formData);
		if (foundryReopen || systemReopen) {
			this.document._onSheetChange({ sheetOpen: true });
		};
	};

	/**
	 * This method is mostly the form submission handler that foundry uses in
	 * DocumentSheetConfig, however because we clobber that in order to save our
	 * own config stuff as well, we need to duplicate Foundry's handling and tweak
	 * it a bit to make it work nicely with our custom saving.
	 *
	 * @this {TAFDocumentSheetConfig}
	 */
	static async #submitFoundry(_event, _form, formData) {
		const { object } = formData;
		const { documentName, type = CONST.BASE_DOCUMENT_TYPE } = this.document;

		// Update themes.
		const themes = game.settings.get(`core`, `sheetThemes`);
		const defaultTheme = foundry.utils.getProperty(themes, `defaults.${documentName}.${type}`);
		const documentTheme = themes.documents?.[this.document.uuid];
		const themeChanged = (object.defaultTheme !== defaultTheme) || (object.theme !== documentTheme);
		if (themeChanged) {
			foundry.utils.setProperty(themes, `defaults.${documentName}.${type}`, object.defaultTheme);
			themes.documents ??= {};
			themes.documents[this.document.uuid] = object.theme;
			await game.settings.set(`core`, `sheetThemes`, themes);
		}

		// Update sheets.
		const { defaultClass } = this.constructor.getSheetClassesForSubType(documentName, type);
		const sheetClass = this.document.getFlag(`core`, `sheetClass`) ?? ``;
		const defaultSheetChanged = object.defaultClass !== defaultClass;
		const documentSheetChanged = object.sheetClass !== sheetClass;

		if (themeChanged || (game.user.isGM && defaultSheetChanged)) {
			if (game.user.isGM && defaultSheetChanged) {
				const setting = game.settings.get(`core`, `sheetClasses`);
				foundry.utils.setProperty(setting, `${documentName}.${type}`, object.defaultClass);
				await game.settings.set(`core`, `sheetClasses`, setting);
			}

			// This causes us to manually rerender the sheet due to the theme or default
			// sheet class changing resulting in no update making it to the client-document's
			// _onUpdate handling
			if (!documentSheetChanged) {
				return true;
			}
		}

		// Update the document-specific override.
		if (documentSheetChanged) {
			this.document.setFlag(`core`, `sheetClass`, object.sheetClass);
		};
		return false;
	};

	/** @this {TAFDocumentSheetConfig} */
	static async #submitSystem(_event, _form, formData) {
		const { FLAGS: flags } = expandObject(formData.object);
		const diff = flattenObject(diffObject(this.document.flags, flags));
		const hasChanges = Object.keys(diff).length > 0;
		if (hasChanges) {
			await this.document.update({ flags });
		};
		return hasChanges;
	};
	// #endregion Actions
};
