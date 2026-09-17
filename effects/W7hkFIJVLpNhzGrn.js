await this.actor.applyDamage(5, {ignoreArmour: true, hazard: true});
if (await this.effect.resistEffect())
{
  await this.actor.addCondition("stunned");
}
else 
{
  await this.actor.addCondition("incapacitated");
}