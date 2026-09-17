if (game.combat.combatants.map(i => i.actor).filter(i => i && !i.sameSideAs(this.actor)).some(i => i.system.attributes.body.value > this.actor.system.attributes.body.value))
{
  this.script.message("Activated!")
  this.effect.update({disabled: false})
}