this.actor.addCondition("poisoned", {}, {"system.scriptData" : [{
  label : "Damage",
  trigger : "startTurn",
  script : "this.actor.applyDamage(2, {ignoreArmour: true})"
}]})