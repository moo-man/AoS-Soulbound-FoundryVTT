if (!(await this.effect.resistEffect()))
{
  this.actor.addCondition("restrained");
}