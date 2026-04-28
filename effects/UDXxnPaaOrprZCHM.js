let autoFail = this.actor.hasCondition("prone") || this.actor.hasCondition("restrained");
let test;
if (!autoFail)
{
  test = await this.actor.system.setupTestFromItem(this.effect.system.sourceData.item, {skipTargets: true, appendTitle : ` - ${this.effect.name}`});
}

if (test?.failed || autoFail)
{
  this.actor.applyDamage(11);
  this.actor.addCondition("prone");
}
else
{
  this.actor.applyDamage(6);
}