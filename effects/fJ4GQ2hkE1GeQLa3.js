let damage = this.effect.sourceTest.message.getFlag(game.system.id, "damage");

if (!damage)
{
  return this.script.notification("No damage was dealt, cannot heal!", "error")
}

this.actor.applyHealing({toughness: damage})