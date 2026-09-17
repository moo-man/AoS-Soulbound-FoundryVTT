await this.actor.applyDamage(this.effect.getFlag(game.system.id, "damage"));
await this.actor.addCondition("prone");