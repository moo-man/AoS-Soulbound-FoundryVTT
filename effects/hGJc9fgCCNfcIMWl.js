if (!(await this.effect.resistEffect()))
{
  await this.actor.applyDamage(this.effect.sourceTest.result.dmg);
  this.actor.addCondition("prone");
}