const { Item } = foundry.documents;

export class TAFItem extends Item {
	async _preCreate() {
		return false;
	};
};
