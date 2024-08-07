if (!this.actor.hasCondition("frightened"))
{
    let test = await this.effect.sourceItem.system.test.roll(this.actor, {fields : {complexity : 3}, appendTitle : ` - ${this.effect.name}`})
    if (test.succeeded)
    {
        await this.actor.addCondition("frightened");
    }
    else
    {
        await this.actor.addCondition("frightened");
        await this.actor.addCondition("blinded");
        await this.actor.addCondition("stunned");
    }
}