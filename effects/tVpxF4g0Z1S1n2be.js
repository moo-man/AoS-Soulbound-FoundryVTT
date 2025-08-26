let blinded = this.actor.hasCondition("blinded")
let charmed = this.actor.hasCondition("charmed")
let deafened = this.actor.hasCondition("deafened")
let frightened = this.actor.hasCondition("frightened")
if (blinded)
{
  blinded.delete();
  this.script.notification("Immune to Blinded");
}
if (charmed)
{
  charmed.delete();
  this.script.notification("Immune to Charmed");
}
if (deafened)
{
  deafened.delete();
  this.script.notification("Immune to Deafened");
}
if (frightened)
{
  frightened.delete();
  this.script.notification("Immune to Frightened");
}