let test = await this.actor.system.setupCommonTest({ attribute: "body", skill: "fortitude"}, {dn: `4:1`, skipTargets: true, appendTitle: ` - ${this.effect.name}`})

if (test.failed)
{
  this.actor.addCondition("stunned");
  return false;
}

else
{
  this.effect.updateSource({duration: {units: "hours", value: test.result.successes}});
}