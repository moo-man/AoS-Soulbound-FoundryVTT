if (!(await this.effect.resistEffect()) && this.actor.uuid != this.effect.sourceActor.uuid)
{
  this.actor.addCondition("prone");
}