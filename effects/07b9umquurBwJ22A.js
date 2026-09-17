this.actor.applyHealing({toughness: this.effect.sourceTest?.result.toughness || 2})

if (!(await this.effect.resistEffect()))
{
  await this.actor.addCondition("stunned");
}