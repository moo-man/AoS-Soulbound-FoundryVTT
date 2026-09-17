let effects = (this.effect.getFlag(game.system.id, "effects") || []).map(e => this.actor.effects.get(e)).filter(i => i);

for(let effect of effects)
{
    effect.update({disabled: false})
}
this.script.notification("Enabling " + effects.map(i => i.name).join(", "));