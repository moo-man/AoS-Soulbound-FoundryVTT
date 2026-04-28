let test = await this.actor.system.setupTestFromItem(this.effect.system.sourceData.item, {skipTargets: true, appendTitle : ` - ${this.effect.name}`});

if (test.failed)
{
  await this.actor.addCondition("stunned");
  this.actor.applyEffect({effects: this.effect.sourceItem.effects.get("C5Y5ARgN5zbe2Ne0")});
}