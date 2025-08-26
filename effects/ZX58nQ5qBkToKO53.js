let poisoned = this.actor.hasCondition("poisoned")
let charmed = this.actor.hasCondition("charmeded")

if (poisoned)
{
  poisoned.delete();
  this.script.notification("Immune to Poison");
}

else if (charmed)
{
  charmed.delete();
  this.script.notification("Immune to Charmed");
}