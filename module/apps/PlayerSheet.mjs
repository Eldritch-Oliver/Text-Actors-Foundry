import { __ID__, filePath } from "../consts.mjs";
import { AttributeManager } from "./AttributeManager.mjs";
import { attributeSorter } from "../utils/attributeSort.mjs";
import { TAFDocumentSheetConfig } from "./TAFDocumentSheetConfig.mjs";
import { TAFDocumentSheetMixin } from "./mixins/TAFDocumentSheetMixin.mjs";
import { toPrecision } from "../utils/roundToPrecision.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;
const { getProperty } = foundry.utils;
const { TextEditor } = foundry.applications.ux;

export class PlayerSheet extends
	TAFDocumentSheetMixin(
	HandlebarsApplicationMixin(
	ActorSheetV2,
)) {

	// #region Options
	static DEFAULT_OPTIONS = {
		classes: [
			__ID__,
			`PlayerSheet`,
		],
		position: {
			width: 575,
			height: 740,
		},
		window: {
			resizable: true,
		},
		form: {
			submitOnChange: true,
			closeOnSubmit: false,
		},
		actions: {
			manageAttributes: this.#manageAttributes,
			configureSheet: this.#configureSheet,
			toggleExpand: this.#toggleExpand,
		},
	};

	static PARTS = {
		header: { template: filePath(`templates/PlayerSheet/header.hbs`) },
		attributes: { template: filePath(`templates/PlayerSheet/attributes.hbs`) },
		tabs: { template: filePath(`templates/generic/tabs.hbs`) },
		content: { template: filePath(`templates/PlayerSheet/content.hbs`) },
		items: {
			template: filePath(`templates/PlayerSheet/item-lists.hbs`),
			scrollable: [``],
			templates: [
				filePath(`templates/PlayerSheet/item.hbs`),
			],
		},
	};

	/**
	 * This tells the Application's TAFDocumentSheetMixin how to rerender this app
	 * when specific properties get changed on the actor, so that it doesn't need
	 * to full-app rendering if we can do a partial rerender instead.
	 */
	static PROPERTY_TO_PARTIAL = {
		"name": [`header`],
		"img": [`header`],
		"system.attr": [`attributes`],
		"system.attr.value": [`attributes`, `content`],
		"system.attr.max": [`attributes`, `content`],
		"system.content": [`content`],
		"system.carryCapacity": [`items`],
	};

	static TABS = {
		primary: {
			initial: `content`,
			labelPrefix: `taf.Apps.PlayerSheet.tab-names`,
			tabs: [
				{ id: `content` },
				{ id: `items` },
			],
		},
	};
	// #endregion Options

	// #region Instance Data
	/**
	 * This Set is used to keep track of which items have had their full
	 * details expanded so that it can be persisted across rerenders as
	 * they occur.
	 */
	#expandedItems = new Set();
	// #endregion Instance Data

	// #region Lifecycle
	_initializeApplicationOptions(options) {
		const sizing = getProperty(options.document, `flags.${__ID__}.PlayerSheet.size`) ?? {};
		const setting = {
			width: game.settings.get(__ID__, `sheetDefaultWidth`),
			height: game.settings.get(__ID__, `sheetDefaultHeight`),
			resizable: game.settings.get(__ID__, `sheetDefaultResizable`),
		};

		options.window ??= {};
		if (sizing.resizable !== ``) {
			options.window.resizable ??= sizing.resizable === `true`;
		}
		else if (setting.resizable !== ``) {
			options.window.resizable ??= setting.resizable === `true`;
		};

		options.position ??= {};

		// Set width
		if (sizing.width) {
			options.position.width ??= sizing.width;
		}
		else if (setting.width) {
			options.position.width ??= setting.width;
		};

		// Set height
		if (sizing.height) {
			options.position.height ??= sizing.height;
		}
		else if (setting.height) {
			options.position.height ??= setting.height;
		};

		return super._initializeApplicationOptions(options);
	};

	_getHeaderControls() {
		const controls = super._getHeaderControls();

		controls.push({
			icon: `fa-solid fa-at`,
			label: `taf.Apps.PlayerSheet.manage-attributes`,
			action: `manageAttributes`,
			visible: () => {
				const isGM = game.user.isGM;
				const allowPlayerEdits = game.settings.get(__ID__, `canPlayersManageAttributes`);
				const editable = this.isEditable;
				return isGM || (allowPlayerEdits && editable);
			},
		});

		return controls;
	};

	async close() {
		this.#attributeManager?.close();
		this.#attributeManager = null;
		return super.close();
	};
	// #endregion Lifecycle

	// #region Data Prep
	async _prepareContext() {
		return {
			meta: {
				idp: this.id,
				editable: this.isEditable,
			},
			actor: this.actor,
			system: this.actor.system,
			editable: this.isEditable,
		};
	};

	async _preparePartContext(partID, ctx) {

		switch (partID) {
			case `attributes`: {
				await this._prepareAttributes(ctx);
				break;
			};
			case `tabs`: {
				ctx.hideTabs = this.actor.items.size <= 0;
				ctx.tabs = await this._prepareTabs(`primary`);
				break;
			};
			case `content`: {
				await this._prepareContent(ctx);
				break;
			};
			case `items`: {
				await this._prepareItems(ctx);
				break;
			};
		};

		return ctx;
	};

	async _prepareAttributes(ctx) {
		ctx.hasAttributes = this.actor.system.hasAttributes;

		const attrs = [];
		for (const [id, data] of Object.entries(this.actor.system.attr)) {
			attrs.push({
				...data,
				id,
				path: `system.attr.${id}`,
			});
		};
		ctx.attrs = attrs.toSorted(attributeSorter);
	};

	async _prepareContent(ctx) {
		// Whether or not the prose-mirror is toggled or always-edit
		ctx.toggled = true;
		ctx.tabActive = this.tabGroups.primary === `content` || this.actor.items.size === 0;

		ctx.enriched = {
			system: {
				content: await TextEditor.implementation.enrichHTML(this.actor.system.content),
			},
		};
	};

	async _prepareItems(ctx) {
		ctx.tabActive = this.tabGroups.primary === `items`;

		const weightUnit = game.settings.get(__ID__, `weightUnit`);
		let totalWeight = 0;

		ctx.itemGroups = [];
		for (const [groupName, items] of Object.entries(this.actor.itemTypes)) {
			const preparedItems = [];

			let summedWeight = 0;
			for (const item of items) {
				summedWeight += item.system.quantifiedWeight;
				preparedItems.push(await this._prepareItem(item));
			};
			totalWeight += summedWeight;

			ctx.itemGroups.push({
				name: groupName.titleCase(),
				items: preparedItems,
				weight: toPrecision(summedWeight, 2) + weightUnit,
			});
		};

		ctx.totalWeight = toPrecision(totalWeight, 2) + weightUnit;
	};

	async _prepareItem(item) {
		const weightUnit = game.settings.get(__ID__, `weightUnit`);
		const ctx = {
			uuid: item.uuid,
			img: item.img,
			name: item.name,
			equipped: item.system.equipped,
			quantity: item.system.quantity,
			weight: item.system.quantifiedWeight + weightUnit,
			isExpanded: this.#expandedItems.has(item.uuid),
			canExpand: item.system.description.length > 0,
		};

		ctx.description = ``;
		if (item.system.description.length > 0) {
			ctx.description = await TextEditor.implementation.enrichHTML(item.system.description);
		};

		return ctx;
	};
	// #endregion Data Prep

	// #region Actions
	#attributeManager = null;

	/**
	 * This action opens an instance of the AttributeManager application
	 * so that the user can edit and update all of the attributes for the
	 * actor. This persists the application instance for the duration of
	 * the ActorSheet's lifespan.
	 *
	 * @this {PlayerSheet}
	 */
	static async #manageAttributes() {
		this.#attributeManager ??= new AttributeManager({ document: this.actor });
		if (this.#attributeManager.rendered) {
			await this.#attributeManager.bringToFront();
		} else {
			await this.#attributeManager.render({
				force: true,
				window: { windowId: this.window.windowId },
			});
		};
	};

	/**
	 * This action overrides the default Foundry action in order to tell
	 * it to open my custom DocumentSheetConfig application instead of
	 * opening the non-customized sheet config app.
	 *
	 * @this {PlayerSheet}
	 */
	static async #configureSheet(event) {
		event.stopPropagation();
		if ( event.detail > 1 ) { return }

		new TAFDocumentSheetConfig({
			document: this.document,
			position: {
				top: this.position.top + 40,
				left: this.position.left + ((this.position.width - 60) / 2),
			},
		}).render({
			force: true,
			window: { windowId: this.window.windowId },
		});
	};

	/**
	 * This action is used by the item lists in order to expand/collapse
	 * the descriptions while maintaining that state across renders.
	 *
	 * @this {PlayerSheet}
	 */
	static async #toggleExpand(event, target) {
		if (event.srcElement instanceof HTMLInputElement) { return };

		const { itemUuid } = target.closest(`[data-item-uuid]`)?.dataset ?? {};
		if (!itemUuid) { return };

		const expanded = this.#expandedItems.has(itemUuid);
		if (expanded) {
			this.#expandedItems.delete(itemUuid);
			target.nextElementSibling.dataset.expanded = false;
		} else {
			this.#expandedItems.add(itemUuid);
			target.nextElementSibling.dataset.expanded = true;
		}
	};
	// #endregion Actions
};
