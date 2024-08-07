let test = await this.effect.sourceItem.system.test.roll(this.actor, {appendTitle : ` - ${this.effect.name}`});
if (test.succeeded)
{
    let roll = await new Roll("1d6 + @doom", this.actor.getRollData()).roll();
    this.actor.applyDamage(roll.total);
    roll.toMessage(this.script.getChatData());
}
else 
{
    let roll = await new Roll("1d6 * @doom", this.actor.getRollData()).roll();
    this.actor.applyDamage(roll.total);
    roll.toMessage(this.script.getChatData());
}