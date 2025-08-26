await this.actor.addCondition("poisoned");
await this.actor.applyDamage(5, {ignoreArmour : true});

if (this.actor.system.bio.species == "Sylvaneth")
{
    await this.actor.update(this.actor.system.combat.addWound("major"))
}