let poisoned = this.actor.hasCondition("poisoned")
let charmed = this.actor.hasCondition("charmed")

if (poisoned)
{
  poisoned.delete();
  this.script.notification("Immune to Poisoned");
}

else if (charmed)
{
  charmed.delete();
  this.script.notification("Immune to Charmed");
}