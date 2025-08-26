let charmed = this.actor.hasCondition("charmed")
let frightened = this.actor.hasCondition("frightened")

if (charmed)
{
  charmed.delete();
  this.script.notification("Immune to Charmed");
}

if (frightened)
{
  frightened.delete();
  this.script.notification("Immune to Frightened");
}