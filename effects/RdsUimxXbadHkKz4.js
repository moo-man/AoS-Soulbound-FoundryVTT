if (this.actor.uuid == this.effect.sourceActor.uuid)
{ 
  return;
}

let test = await this.actor.setupCommonTest({attribute : "body", skill : "fortitude"}, {fields : {difficulty : 4, complexity : 1}, appendTitle : ` - ${this.effect.name}`, skipTargets: true});

if (test.result.successes < this.effect.sourceTest.result.successes)
{
  await this.actor.addCondition("poisoned");
}