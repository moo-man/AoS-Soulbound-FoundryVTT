let test = await this.actor.system.setupCommonTest({skill : "determination"}, {dn : `4:${this.effect.sourceActor.system.attributes.soul.value}`, appendTitle : ` - ${this.effect.name}`})
if (test.failed)
{
    this.actor.addCondition("frightened");
}