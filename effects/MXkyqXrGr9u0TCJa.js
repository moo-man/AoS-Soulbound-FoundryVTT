let test = await this.actor.setupCommonTest({attribute : "body", skill : "fortitude"}, {dn: "4:1", skipTargets: true, appendTitle : ` - ${this.effect.name}`});

let diffSuccesses = this.effect.getFlag(game.system.id, "successes") - test.result.successes;

if (diffSuccesses > 0)
{
  this.actor.applyDamage(diffSuccesses);
  if (diffSuccesses > this.actor.system.combat.armour.value)
  { 
    this.actor.addCondition("poisoned");
  }
}