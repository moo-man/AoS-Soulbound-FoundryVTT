let test = await this.actor.system.setupCommonTest({ attribute: "soul", skill: "determination"}, {dn: `6:1`, skipTargets: true, appendTitle: ` - ${this.effect.name}`});

if (test.failed)
{
  this.effect.update({disabled: true});
}