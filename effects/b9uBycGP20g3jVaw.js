let test = await this.actor.system.setupCommonTest({skill : "reflexes"}, {dn: "4:1", appendTitle : ` - ${this.effect.name}`});
let diffSuccesses = Math.max(0, this.effect.sourceTest.result.successes - test.result.successes);

if (diffSuccesses)
{
    this.actor.applyDamage(diffSuccesses)
}