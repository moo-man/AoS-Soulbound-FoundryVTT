if (this.actor.uuid != this.effect.sourceActor.uuid && !(await this.effect.resistEffect()))
{
  this.actor.addCondition("prone");
}