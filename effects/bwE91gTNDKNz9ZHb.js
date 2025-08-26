let poisoned = this.actor.hasCondition("poisoned");
if (poisoned)
{
  this.actor.update(this.actor.system.combat.addWound("minor"))
}
else
{
  this.actor.addCondition("poisoned");
}