this.actor.applyDamage(5, {hazard: true});
let test = await this.actor.system.setupCommonTest({ attribute: "body", skill: "might" }, { dn: `4:1`, skipTargets: true, appendTitle: ` - ${this.effect.name}` })

if (test.failed) 
{
  this.actor.addCondition("prone");
}