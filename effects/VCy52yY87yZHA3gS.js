let combatant = game.combat?.turns.find(i => i.actor?.uuid == this.actor.uuid);

if (combatant)
{
  this.script.notification("Initiative set to 0");
  combatant.update({initiative : 0});
}