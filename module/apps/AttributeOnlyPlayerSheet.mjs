import { PlayerSheet } from "./PlayerSheet.mjs";

const { deepClone } = foundry.utils;

const removedParts = new Set([`content`]);

export class AttributeOnlyPlayerSheet extends PlayerSheet {
	// #region Options
	static DEFAULT_OPTIONS = {
		position: {
			height: `auto`,
		},
	};

	static get PARTS() {
		const parts = deepClone(super.PARTS);
		delete parts.content;
		return parts;
	};

	static get TABS() {
		const tabs = deepClone(super.TABS);
		tabs.primary.tabs = tabs.primary.tabs
			.filter(tab => tab.id !== `content`);
		tabs.primary.initial = tabs.primary.tabs.at(0).id;
		return tabs;
	};
	// #endregion Options

	// #region Instance Data
	/**
	 * This method is used in order to ensure that when we hide specific
	 * tabs due to programmatic logic (e.g. having no items), that the tab
	 * doesn't stay selected in the app if the logic for it being visible
	 * no longer holds true.
	 */
	_assertSelectedTabs() {
		// Intentional No-Op Function
	};

	get hasContentTab() {
		return false;
	};
	// #endregion Instance Data

	// #region Lifecycle
	_configureRenderOptions(options) {
		super._configureRenderOptions(options);

		// don't attempt to rerender the parts that get removed
		options.parts = options.parts?.filter(partID => !removedParts.has(partID));
	};
	// #endregion Lifecycle

	// #region Data Prep
	async _prepareItems(ctx) {
		await super._prepareItems(ctx);
		ctx.tabActive &&= this.hasItemsTab;
	};
	// #endregion Data Prep
};
