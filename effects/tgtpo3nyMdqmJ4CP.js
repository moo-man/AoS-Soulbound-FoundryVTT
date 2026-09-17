let damage = 3;
this.script.notification(`Applied ${damage} to ${this.actor.name}`)
this.actor.applyDamage(damage);