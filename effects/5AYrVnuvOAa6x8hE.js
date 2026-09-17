let roll = await this.script.roll("1d6");
await this.actor.applyDamage(roll, {ignoreArmour : true});