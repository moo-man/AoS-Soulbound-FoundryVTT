let test = await this.actor.system.setupCommonTest({skill : "devotion", attribute : "soul"}, {dn: "4:1", appendTitle : `- ${this.effect.name}`});

let damage = test.result.successes;

await this.actor.applyDamage(damage, {ignoreArmour: true});

if (damage > this.actor.system.attributes.body.value)
{
  this.script.message("Dies instantly!")
  this.actor.addCondition("dead");
}