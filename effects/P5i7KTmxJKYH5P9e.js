let prone = this.actor.hasCondition("prone")
if (prone)
{
  prone.delete();
  this.script.notification("Immune to Prone");
}