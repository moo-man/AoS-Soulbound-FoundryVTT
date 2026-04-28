if (this.actor.system.combat.health.wounds.max == 0)
{
  await this.actor.addCondition("dead");
  await this.actor.update({"system.combat.health.toughness.value" : 0})
}
else 
{
  await this.actor.update(this.actor.system.combat.addWound("serious"))
}