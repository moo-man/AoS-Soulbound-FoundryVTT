let test = await this.actor.setupCommonTest({attribute : "body", skill : "fortitude"}, {fields : {difficulty : 4, complexity : 1}, appendTitle : ` - ${this.effect.name}`});

if (test.result.successes < this.effect.sourceTest.result.successes)
{
  let successDiff = this.effect.sourceTest.result.successes - test.result.successes;
  await this.actor.addCondition("poisoned");
  await this.actor.applyDamage(successDiff, {ignoreArmour: true})
}
else 
{
  this.script.notification("Resisted")
  return false;
}