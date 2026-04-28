let toughness = this.effect.getFlag(game.system.id, "toughness")
this.actor.applyHealing({toughness});
this.script.message("Healed " + toughness + " Toughness")