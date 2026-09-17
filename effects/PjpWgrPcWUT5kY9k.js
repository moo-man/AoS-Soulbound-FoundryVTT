if (game.combat)
{
	let target = game.combat.getCombatantByActor(this.actor);
	let attacker = game.combat.getCombatantByActor(args.actor);
	return target.initiative > attacker.initiative
}
else return true;