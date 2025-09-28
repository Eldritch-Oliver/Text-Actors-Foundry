declare global {
	class Hooks extends foundry.helpers.Hooks {};
	const fromUuid = foundry.utils.fromUuid;
}

interface Actor {
	/** The system-specific data */
	system: any;
};

interface Item {
	/** The system-specific data */
	system: any;
};
