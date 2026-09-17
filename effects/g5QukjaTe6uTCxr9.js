let damage = this.effect.sourceTest?.result.damage.total || 2;
this.script.notification(`Applied ${damage} to ${this.actor.name}`)
this.actor.applyDamage(damage);