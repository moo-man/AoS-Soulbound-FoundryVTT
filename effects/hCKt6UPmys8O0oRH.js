let frightened = this.actor.hasCondition("frightened")
if (frightened)
{
  frightened.delete();
  this.script.notification("Immune to Frightened");
}