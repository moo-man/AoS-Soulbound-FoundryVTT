let test = await this.actor.system.setupCommonTest({ attribute: "body", skill: "might"}, {dn: `4:1`, skipTargets: true, appendTitle: ` - ${this.effect.name}`});

if (test.result.successes >= game.counter.soulfire)
{
  this.script.message("Gained an additional point of Waaagh! Energy");
  game.counter.change(1, "soulfire");
}