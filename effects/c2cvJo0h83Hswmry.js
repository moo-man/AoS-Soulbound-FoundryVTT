let test = await this.actor.system.setupCommonTest({ attribute: "body", skill: "fortitude"}, {dn: `4:${1 + this.effect.sourceTest.result.degree}`, skipTargets: true, appendTitle: ` - ${this.effect.name}`})

if (test.failed)
{
  this.actor.addCondition("poisoned");
}