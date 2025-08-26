this.actor.applyDamage(3, {penetrating : 1})
let test = await this.actor.system.setupCommonTest({attribute : "body", skill : "fortitude"}, {fields : {difficulty : 4, complexity : 2}, appendTitle : ` - ${this.effect.sourceItem?.name || ""}`});

if (test.failed)
{
    this.actor.addCondition("poisoned");
}