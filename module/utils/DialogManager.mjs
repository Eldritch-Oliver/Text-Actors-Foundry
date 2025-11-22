import { Ask } from "../apps/Ask.mjs";

/** @type {Map<string, Promise>} */
const promises = new Map();

/** @type {Map<string, ApplicationV2>} */
const dialogs = new Map();

export function close(id) {
	dialogs.get(id)?.close();
	dialogs.delete(id);
	promises.delete(id);
};

/**
 * Asks the user to provide a simple piece of information, this is primarily
 * intended to be used within macros so that it can have better info gathering
 * as needed. This returns an object of input keys/labels to the value the user
 * input for that label, if there is only one input, this will return the value
 * without an object wrapper, allowing for easier access.
 *
 * @param {AskConfig} data
 * @param {AskOptions} opts
 * @returns {AskResult}
 */
export async function ask(
	data,
	{
		onlyOneWaiting = true,
		alwaysUseAnswerObject = true,
	} = {},
) {
	if (!data.id) {
		return {
			state: `errored`,
			error: `An ID must be provided`,
		};
	};
	if (!data.inputs.length) {
		return {
			state: `errored`,
			error: `At least one input must be provided`,
		};
	};
	const id = data.id;

	// Don't do multi-thread waiting
	if (dialogs.has(id)) {
		const app = dialogs.get(id);
		app.bringToFront();
		if (onlyOneWaiting) {
			return { state: `fronted` };
		} else {
			return promises.get(id);
		};
	};

	let autofocusClaimed = false;
	for (const i of data.inputs) {
		i.id ??= foundry.utils.randomID(16);
		i.key ??= i.label;

		switch (i.type) {
			case `input`: {
				i.inputType ??= `text`;
			}
		}

		// Only ever allow one input to claim autofocus
		i.autofocus &&= !autofocusClaimed;
		autofocusClaimed ||= i.autofocus;

		// Set the value's attribute name if it isn't specified explicitly
		if (!i.valueAttribute) {
			switch (i.inputType) {
				case `checkbox`:
					i.type = `checkbox`;
					delete i.valueAttribute;
					delete i.inputType;
					break;
				default:
					i.valueAttribute = `value`;
			};
		};
	};

	const promise = new Promise((resolve) => {
		const app = new Ask({
			...data,
			alwaysUseAnswerObject,
			onClose: () => {
				dialogs.delete(id);
				promises.delete(id);
				resolve({ state: `prompted` });
			},
			onConfirm: (answers) => resolve({ state: `prompted`, answers }),
		});
		app.render({ force: true });
		dialogs.set(id, app);
	});

	promises.set(id, promise);
	return promise;
};

export function size() {
	return dialogs.size;
};

export const DialogManager = {
	close,
	ask,
	size,
};
