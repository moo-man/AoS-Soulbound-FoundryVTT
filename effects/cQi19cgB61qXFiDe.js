args.actor.applyEffect({effectData: {
  name : "On Fire",
  img : this.effect.img,
  statuses: ["onFire"],
  system : {
    scriptData: [{
      label : "Damage",
      trigger : "startTurn",
      script : "this.actor.applyDamage(1, {ignoreArmour: true})"
    }]
  }
}})