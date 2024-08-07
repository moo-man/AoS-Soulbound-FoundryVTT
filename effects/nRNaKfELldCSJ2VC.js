let test = await this.effect.sourceItem.system.test.roll(this.actor, {appendTitle : ` - ${this.effect.name}`});
if (test.succeeded)
{
    await this.actor.applyDamage(5);
}
else 
{
    await this.actor.update({"system.combat.health.toughness.value" : 0})
    if (this.actor.system.combat.health.wounds.max == 0)
    {
        this.actor.addCondition("dead");
    }
}