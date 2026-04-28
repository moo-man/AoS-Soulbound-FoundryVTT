let test = await this.actor.setupCommonTest({attribute : "soul", skill : "determination"}, {dn: "4:1", skipTargets: true, appendTitle : ` - ${this.effect.name}`});

let diffSuccesses = this.effect.getFlag(game.system.id, "successes") - test.result.successes;

if (this.effect.getFlag(game.system.id, "successes") > test.result.successes)
{
  this.actor.addCondition("frightened");
}