if (!(await this.effect.resistEffect()))
{
  await this.actor.addCondition("prone");
  await this.actor.addCondition("poisoned");
  await this.actor.applyDamage(6);
}
else 
{
  await this.actor.applyDamage(3);
}