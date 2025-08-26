let damage = this.effect.sourceTest.result.damage.total;

this.effect.sourceActor.applyHealing({toughness: damage});