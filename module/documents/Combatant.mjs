const { Combatant } = foundry.documents;

export class TAFCombatant extends Combatant {
	_getInitiativeFormula() {
		return game.settings.get(`taf`, `initiativeFormula`);
	};
};
