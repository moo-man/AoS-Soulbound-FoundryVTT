let newMax = this.actor.system.combat.health.toughness.value + 7;
if (newMax > this.actor.system.combat.health.toughness.max)
{
  this.effect.updateSource({"system.changes" : [{mode: "add", key: "system.combat.health.toughness.max", value: newMax - this.actor.system.combat.health.toughness.max}]});
}