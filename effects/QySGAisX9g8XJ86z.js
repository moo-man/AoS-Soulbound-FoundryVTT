let result  = await this.actor.applyDamage(1, {ignoreArmour: true, hazard: true});
if (result.damage)
{
  await this.actor.addCondition("poisoned");
}