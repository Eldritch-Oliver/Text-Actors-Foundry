/*
This file contains utility methods used by Applications in order to be
DRYer
*/

/**
 * Updates a document using the UUID, this is most useful for editing
 * documents from a sheet of another document (e.g. an Item embedded
 * in an Actor). This requires the dataset of the element to have a
 * "data-foreign-name" which is the data path of the property being
 * edited. As well as the input, or a parent of it, to have the
 * "data-foreign-uuid" attribute, representing the UUID of the document
 * to edit.
 */
export async function updateForeignDocumentFromEvent(event) {
	const target = event.currentTarget;
	const name = target.dataset.foreignName;
	let uuid = target.dataset.foreignUuid;
	uuid ??= target.closest(`[data-foreign-uuid]`)?.dataset.foreignUuid;

	if (!name || !uuid) {
		throw `Cannot edit foreign document with the name and UUID`;
	};

	let value = target.value;
	switch (target.type) {
		case `checkbox`: value = target.checked; break;
	};

	let doc = await fromUuid(uuid);
	await doc?.update({ [name]: value });
};
