this.effect.update({"disabled": false}).then(_ => {
  this.actor.update({"system.combat.mettle.value" : this.actor.system.combat.mettle.value + 1});
})