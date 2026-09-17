let actor = args.actor;
if (args.remaining <= 0)
{  
    let combat = actor.system.combat;
    if (combat.health.toughness.value == 0 && combat.health.wounds.max > 0)
    {
        this.script.message("All Wounds caused by <strong>Varanite</strong> are <strong>Deadly</strong>")
    }
}