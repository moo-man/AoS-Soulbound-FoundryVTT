if (!(await this.effect.resistEffect()))
{ 
  await this.actor.addCondition("restrained");
}