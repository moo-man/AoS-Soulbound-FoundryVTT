let test = await this.effect.sourceItem.system.test.roll(this.actor, {appendTitle : ` - ${this.effect.name}`});
if (test.succeeded)
{
    await this.actor.applyDamage(10);
    await this.actor.addCondition("frightened");
}
else 
{
    await this.actor.update({"system.combat.health.toughness.value" : 0})
    if (this.actor.system.combat.health.wounds.max == 0)
    {
        this.actor.addCondition("dead");
        this.actor.getActiveTokens().forEach(t => {
            t.document?.update({"texture.tint" : "#a51d93"})
        })
    }
}