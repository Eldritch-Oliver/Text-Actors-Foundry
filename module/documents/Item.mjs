export class TAFItem extends foundry.documents.Item {
	static getDefaultArtwork(itemData) {
		switch (itemData.type) {
			case `attribute`: return { img: `icons/svg/jump.svg` };
		};
		return super.getDefaultArtwork(itemData);
	};
};
