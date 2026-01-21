import { __ID__ } from "../consts.mjs";

const { Combatant } = foundry.documents;

export class TAFCombatant extends Combatant {
	_getInitiativeFormula() {
		return game.settings.get(__ID__, `initiativeFormula`);
	};
};
