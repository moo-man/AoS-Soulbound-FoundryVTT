await this.actor.applyDamage(3, {ignoreArmour: true, hazard: true});
if (this.actor.hasCondition("poisoned"))
{
  await this.actor.addCondition("stunned");
}
else 
{
  await this.actor.addCondition("poisoned");
}