let actor = args.actor;
if (args.remaining <= 0 && actor.type == "npc")
{  
    let combat = actor.system.combat;
    if (combat.health.toughness.value == 0 && combat.health.wounds.value >= combat.health.wounds.max)
    {
        this.actor.update({"system.combat.health.toughness.value" : this.actor.system.combat.health.toughness.value + actor.system.attributes.soul.value})
        this.script.message(`Healed ${actor.system.attributes.soul.value} Toughness.`)
    }
}