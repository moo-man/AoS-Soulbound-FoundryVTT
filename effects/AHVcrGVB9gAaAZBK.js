let combatant = game.combat.turns.find(i => i.actor?.uuid == this.actor.uuid)
let flags = combatant.flags[game.system.id];
if (flags.initiative)
{
    combatant.update({"flags.age-of-sigmar-soulbound.initiative" : null, initiative : flags.initiative}).then(() => {
        this.script.notification("Deactivated")
        this.actor._initialize();
        if (this.actor.sheet.rendered)
        {
            this.actor.sheet.render(true);
        }
    })
}