if (this.actor.uuid != this.effect.sourceActor.uuid)
{
  if (await this.effect.resistEffect())
  {
    this.actor.removeCondition("frightened");
  }
  else 
  {
    this.actor.addCondition("frightened");
  }
}