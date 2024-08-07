let test = await this.effect.sourceItem.system.test.roll(this.actor, {appendTitle : ` - ${this.effect.name}`});
if (test.succeeded)
{
    await this.actor.applyDamage(this.actor.system.attributes.soul.value, {ignoreArmour: true});
}
else 
{
    this.script.message(`<strong>${this.actor.name}'s</strong> soul is ripped from their body. Their Soul becomes 0, they can no longer use Mettle and do not recover Mettle`);
    if (this.actor.system.combat.health.wounds.max == 0)
    {
        this.actor.addCondition("dead");
    }
    else 
    {
        this.actor.update(this.actor.system.combat.addWound("minor"))
    }
}