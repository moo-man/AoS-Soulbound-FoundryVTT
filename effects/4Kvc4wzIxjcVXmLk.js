if (!this.actor.sameSideAs(this.effect.sourceActor))
{
    let test = await this.actor.setupCommonTest({skill : "determination"}, {appendTitle : ` - Frightened`, fields: {difficulty : 5, complexity : 3}});
    if (test.failed)
    {
        this.actor.addCondition("frightened");
        return false;
    }
}