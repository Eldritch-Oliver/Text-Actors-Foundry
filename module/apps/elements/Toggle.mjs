import { StyledShadowElement } from "./StyledShadowElement.mjs";

const { debounce } = foundry.utils;

export class TafToggle extends StyledShadowElement(HTMLElement) {
	static elementName = `taf-toggle`;
	static formAssociated = true;

	static _stylePath = `toggle.css`;

	_mounted;
	_internals;

	constructor() {
		super({ focusable: true });

		this._internals = this.attachInternals();
		this._internals.role = `checkbox`;
	};

	get type() {
		return `checkbox`;
	};

	get name() {
		return this.getAttribute(`name`);
	};
	set name(newName) {
		this.setAttribute(`name`, newName);
	};

	get value() {
		return this._input.value;
	};
	set value(newValue) {
		this._input.value = newValue;
	};

	get checked() {
		return this._input.checked ?? false;
	};
	set checked(newValue) {
		if (typeof newValue !== `boolean`) { return };
		this._input.checked = newValue;
		this.#emitEvents();
	};

	get disabled() {
		return this.matches(`:disabled`);
	};
	set disabled(value) {
		this.toggleAttribute(`disabled`, value);
	};

	get editable() {
		return true;
	};

	connectedCallback() {
		super.connectedCallback();
		if (this._mounted) { return };

		this._internals.checked = this.hasAttribute(`checked`);

		/*
		This converts all of the double-dash prefixed properties on the
		element to CSS variables so that they don't all need to be
		provided by doing style=""
		*/
		for (const attrVar of this.attributes) {
			if (attrVar.name?.startsWith(`var:`)) {
				const prop = attrVar.name.replace(`var:`, ``);
				this.style.setProperty(`--` + prop, attrVar.value);
			};
		};

		const container = document.createElement(`div`);
		container.classList = `toggle`;
		container.dataset.type = `round`;

		const input = this._input = document.createElement(`input`);
		input.type = `checkbox`;
		input.toggleAttribute(`switch`, true);
		input.checked = this.hasAttribute(`checked`);
		input.addEventListener(`change`, () => {
			this.#emitEvents();
		});

		this.addEventListener(`click`, () => {
			input.click();
		});

		container.appendChild(input);

		const slider = document.createElement(`div`);
		slider.classList = `slider`;
		container.appendChild(slider);

		this._shadow.appendChild(container);

		this._mounted = true;
	};

	disconnectedCallback() {
		super.disconnectedCallback();
		if (!this._mounted) { return };
		this._mounted = false;
	};

	#emitEvents = debounce(
		() => {
			this.dispatchEvent(new Event(`input`, {bubbles: true, cancelable: false}));
			this.dispatchEvent(new Event(`change`, {bubbles: true, cancelable: false}));
		},
		150,
	);
};
