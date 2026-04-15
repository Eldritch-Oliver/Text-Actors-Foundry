import { __ID__ } from "../consts.mjs";

Hooks.on(`renderSettingsConfig`, (app, html) => {
	/*
	This section is used to insert a button into the settings config that unsets
	a world setting when it exists but doesn't allow any other form of editing it.
	*/
	if (game.user.isGM && game.settings.get(__ID__, `actorDefaultAttributes`)) {
		const formGroup = document.createElement(`div`);
		formGroup.classList = `form-group`;

		const label = document.createElement(`div`);
		label.innerHTML = _loc(`taf.settings.actorDefaultAttributes.name`);

		const formFields = document.createElement(`div`);
		formFields.classList = `form-fields`;

		const button = document.createElement(`button`);
		button.type = `button`;
		button.innerHTML = _loc(`taf.settings.actorDefaultAttributes.label`);
		button.addEventListener(`click`, () => {
			game.settings.set(__ID__, `actorDefaultAttributes`, undefined);
		});

		const hint = document.createElement(`p`);
		hint.classList = `hint`;
		hint.innerHTML = _loc(`taf.settings.actorDefaultAttributes.hint`);

		formFields.appendChild(button);
		formGroup.appendChild(label);
		formGroup.appendChild(formFields);
		formGroup.appendChild(hint);

		/** @type {HTMLElement|undefined} */
		const tab = html.querySelector(`.tab[data-group="categories"][data-tab="system"]`);
		tab?.insertAdjacentElement(`afterbegin`, formGroup);
	};
});
