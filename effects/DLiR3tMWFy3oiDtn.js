let test = await this.actor.system.setupCommonTest({skill : "determination"}, {appendTitle: `- ${this.effect.name}`, fields : {difficulty : 5, complexity : 2}});
if (test.failed)
{
    await this.actor.addCondition("stunned")
    await this.actor.update(this.actor.system.combat.addWound("serious"))
}