let actor = args.actor;
if (args.remaining <= 0 && actor.type == "npc" && actor.system.bio.type != 1)
{  
    let combat = actor.system.combat;
    if (combat.health.toughness.value == 0 && combat.health.wounds.value >= combat.health.wounds.max)
    {
        if (this.item.getFlag(game.system.id, "mode") == "kalabrax")
        {
            this.script.message(`<strong>${this.actor.name}</strong> must attack another enemy or ally within Close Range`)   
        }
        else 
        {
            let healed = Math.ceil(actor.system.combat.health.toughness.max / 2);
            this.actor.update({"system.combat.health.toughness.value" : this.actor.system.combat.health.toughness.value + healed})
            this.script.message(`<strong>${this.actor.name}</strong> heals ${healed} Toughness and must Move toward the nearest non-Minion ally or enemy`);
        }
    }
}