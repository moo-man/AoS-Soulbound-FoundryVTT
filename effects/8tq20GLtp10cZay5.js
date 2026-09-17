this.effect.updateSource({"system.changes" : [{
  key: "system.combat.armour.bonus",
  type: "subtract",
  value: this.effect.sourceTest?.result.armour || 1
}]})