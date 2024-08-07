let test = await this.actor.setupCommonTest({skill : "determination"}, {dn : "6:1", appendTitle : ` - ${this.effect.name}`})
if (test.succeeded)
{
    this.actor.hasCondition("frightened")?.delete();
}