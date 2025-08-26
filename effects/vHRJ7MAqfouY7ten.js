this.actor.addCondition("restrained", {}, {"system.scriptData" : [{
  label : "Damage",
  trigger : "startTurn",
  script : "this.actor.applyDamage(3)"
}]})