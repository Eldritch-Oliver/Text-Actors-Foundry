import { __ID__, filePath } from "../consts.mjs";

const { HandlebarsApplicationMixin, ApplicationV2 } = foundry.applications.api;

const validInputTypes = [
	`checkbox`,
	`details`,
	`divider`,
	`error`,
	`input`,
	`select`,
];

export class Ask extends HandlebarsApplicationMixin(ApplicationV2) {
	// #region Options
	static DEFAULT_OPTIONS = {
		tag: `dialog`,
		classes: [
			__ID__,
			`dialog`, // accesses some Foundry-provided styling
			`Ask`,
		],
		position: {
			width: 330,
		},
		window: {
			title: `Questions`,
			resizable: true,
			minimizable: true,
			contentTag: `form`,
		},
		form: {
			closeOnSubmit: true,
			submitOnChange: false,
			handler: this.#submit,
		},
		actions: {
			cancel: this.#cancel,
		},
	};

	static PARTS = {
		inputs: {
			template: filePath(`templates/Ask/inputs.hbs`),
			templates: validInputTypes.map(type => filePath(`templates/Ask/inputs/${type}.hbs`)),
		},
		controls: {
			template: filePath(`templates/Ask/controls.hbs`),
		},
	};
	// #endregion Options

	// #region Instance
	_inputs = [];
	alwaysUseAnswerObject = false;

	/** @type {string | undefined} */
	_description = undefined;

	/** @type {Function | undefined} */
	_userOnConfirm;

	/** @type {Function | undefined} */
	_userOnCancel;

	/** @type {Function | undefined} */
	_userOnClose;

	constructor({
		inputs = [],
		description = undefined,
		onConfirm,
		onCancel,
		onClose,
		alwaysUseAnswerObject,
		...options
	} = {}) {
		super(options);
		this.alwaysUseAnswerObject = alwaysUseAnswerObject;

		for (const input of inputs) {
			if (!validInputTypes.includes(input.type)) {
				input.details = `Invalid input type provided: ${input.type}`;
				input.type = `error`;
			};
		};

		this._inputs = inputs;
		this._description = description;
		this._userOnCancel = onCancel;
		this._userOnConfirm = onConfirm;
		this._userOnClose = onClose;
	};
	// #endregion Instance

	// #region Lifecycle
	async _onFirstRender() {
		super._onFirstRender();
		this.element.show();
	};

	async _prepareContext() {
		return {
			inputs: this._inputs,
			description: this._description,
		};
	};

	async _onClose() {
		super._onClose();
		this._userOnClose?.();
	};
	// #endregion Lifecycle

	// #region Actions
	/** @this {AskDialog} */
	static async #submit(_event, _element, formData) {
		const answers = formData.object;
		const keys = Object.keys(answers);
		if (keys.length === 1 && !this.alwaysUseAnswerObject) {
			this._userOnConfirm?.(answers[keys[0]]);
			return;
		};
		this._userOnConfirm?.(answers);
	};

	/** @this {AskDialog} */
	static async #cancel() {
		this._userOnCancel?.();
		this.close();
	};
	// #endregion Actions
};
