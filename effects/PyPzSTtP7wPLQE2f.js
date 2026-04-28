let test = await this.actor.system.setupTestFromItem(this.effect.system.sourceData.item, {skipTargets: true, appendTitle : ` - ${this.effect.name}`});

if (test.failed)
{
  if (this.actor.system.combat.health.wounds.max)
  {
    let woundDiff = this.actor.system.combat.health.wounds.max - this.actor.system.combat.health.wounds.value;
    await this.actor.update(foundry.utils.mergeObject({"system.combat.health.toughness.value" : 0}, this.actor.system.combat.addWound("", woundDiff)));
  }
  else 
  {
    await this.actor.addCondition("dead");
    await this.actor.update({"system.combat.health.toughness.value" : 0});
  }
}
else
{
  this.actor.applyDamage(6, {ignoreArmour: true});
}