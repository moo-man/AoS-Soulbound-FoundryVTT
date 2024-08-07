let zone = await fromUuid(this.effect.system.sourceData.zone);

let sameZone = zone.getFlag(game.system.id, "effects")?.find(i => i.name == "Shadow Geminid");

let complexity = sameZone ? 6 : 3;
if (!this.actor.hasCondition("frightened"))
{
    let test = await this.effect.sourceItem.system.test.roll(this.actor, {fields : {complexity : 3}, appendTitle : ` - ${this.effect.name}`})
    if (test.succeeded)
    {
        await this.actor.addCondition("blinded");
    }
    else
    {
        await this.actor.addCondition("frightened");
        await this.actor.addCondition("blinded");
        await this.actor.addCondition("stunned");
    }
}