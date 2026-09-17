await this.actor.applyHealing({ toughness: this.effect.sourceTest.result.toughness });
await this.actor.removeCondition("poisoned");