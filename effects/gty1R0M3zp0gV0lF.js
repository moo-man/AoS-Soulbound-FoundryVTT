await this.actor.applyDamage(this.effect.sourceTest.result.damageTotal, {test: this.effect.sourceTest, item: this.effect.sourceItem});
this.actor.addCondition("prone");