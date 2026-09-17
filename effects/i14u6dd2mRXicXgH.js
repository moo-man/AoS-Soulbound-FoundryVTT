if (!args.damage)
{
  return;
}
let test = await args.actor.system.setupCommonTest({ attribute: "body", skill: "fortitude"}, {dn: `4:${args.damage}`, skipTargets: true, appendTitle: ` - ${this.effect.name}`})

if (test.failed)
{
  args.actor.addCondition("poisoned");
}