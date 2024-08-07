let uses = this.effect.getFlag(game.system.id, "blockedHits") || 0
let soul = this.actor.system.attributes.soul.value
if (uses < soul)
{
    uses++;
    args.abort = `<strong>${this.effect.name}</strong>: Hit Ignored (${uses}/${soul})`
}
this.effect.setFlag(game.system.id, "blockedHits", uses)