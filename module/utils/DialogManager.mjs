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

	validateInputs(data.inputs);

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

/**
 * Ensures all of the inputs are correctly valid and performs any
 * mutations to them required in order to make them valid or assign
 * defaults for properties that are missing.
 *
 * @param {AskInput[]} inputs The array of inputs for the dialog
 * @param {boolean} [autofocusClaimed] Whether or not to allow
 * autofocusing an input
 */
function validateInputs(inputs, autofocusClaimed = false) {
	for (const i of inputs) {
		i.id ??= foundry.utils.randomID(16);
		i.key ??= i.label;

		// Only ever allow one input to claim autofocus
		i.autofocus &&= !autofocusClaimed;
		autofocusClaimed ||= i.autofocus;

		// Set the value's attribute name if it isn't specified explicitly
		if (i.type === `input`) {
			i.inputType ??= `text`;
			switch (i.inputType) {
				case `checkbox`:
					i.type = `checkbox`;
					delete i.valueAttribute;
					delete i.inputType;
					break;
				default:
					i.valueAttribute ??= `value`;
			};
		};

		// Recurse on child inputs if required
		if (i.type === `collapse` && i.inputs?.length > 0) {
			validateInputs(i.inputs, autofocusClaimed);
		};
	};
};

export const DialogManager = {
	close,
	ask,
	size,
};
