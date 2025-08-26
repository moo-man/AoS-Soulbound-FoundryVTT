let poisoned = this.actor.hasCondition("poisoned")
if (poisoned)
{
  poisoned.delete();
  this.script.notification("Immune to Poison");
}