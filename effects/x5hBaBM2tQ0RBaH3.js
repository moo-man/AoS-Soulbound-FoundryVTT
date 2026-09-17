let effects = [];
for(let effect of this.actor.effects)
{
  if (effect.sourceItem?.type == "spell")
  {
    effect.update({disabled: true})
    effects.push(effect);
  }
}

this.script.notification("Disabling " + effects.map(i => i.name).join(", "));

this.effect.updateSource({[`flags.${game.system.id}.effects`] : effects.map(i => i.id)})