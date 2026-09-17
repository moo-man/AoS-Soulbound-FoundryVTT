let damage = Math.max(this.effect.sourceActor.system.attributes.soul.value,this.effect.sourceActor.system.attributes.mind.value);

this.actor.applyDamage(damage, {ignoreArmour: true});