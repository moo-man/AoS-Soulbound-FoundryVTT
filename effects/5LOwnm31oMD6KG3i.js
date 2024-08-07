if (!this.actor.hasCondition("frightened") || !this.actor.hasCondition("blinded"))
{
    let test = await this.effect.sourceItem.system.test.roll(this.actor, {appendTitle : ` - ${this.effect.name}`})
    if (test.succeeded)
    {
        await this.actor.addCondition("frightened");
        await this.actor.addCondition("blinded");
    }
    else
    {
        await this.actor.addCondition("frightened");
        await this.actor.addCondition("blinded");
        await this.actor.addCondition("stunned");
    }
}