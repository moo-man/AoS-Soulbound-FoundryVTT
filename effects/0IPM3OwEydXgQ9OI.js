let roll = await new Roll("1d6").roll();

roll.toMessage(this.script.getChatData());
let toughness = this.actor.system.combat.health.toughness;
if (toughness.max == toughness.value)
{
    let test = await this.effect.sourceItem?.system.test.roll(this.actor, {appendTitle : ` - ${this.effect.name}`})
    if (test.failed)
    {
        this.actor.addCondition("stunned");
    }
}
else 
{
    this.actor.applyHealing({toughness : roll.total});
}