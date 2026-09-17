let combatant = game.combat.turns.find(i => i.actor?.uuid == this.actor.uuid)
if (combatant && combatant.initiative != 100)
{
    combatant.update({initiative : 100});
}