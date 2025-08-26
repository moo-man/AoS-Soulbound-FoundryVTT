let roll = this.effect.flags.roll;

if (roll <= 2)
{
    this.actor.addCondition("deafened");
}
else if (roll <= 11)
{
    let test = await this.actor.system.setupCommonTest({skill : "reflexes"}, {fields : {difficulty : 5, complexity : 2}, appendTitle : ` - Prone`})
    if (test.failed)
    {
        await this.actor.addCondition("prone");
    }
}
else if (roll == 12)
{
    await this.actor.applyDamage(5);
    await this.actor.addCondition("prone");
    await this.actor.addCondition("stunned");
}