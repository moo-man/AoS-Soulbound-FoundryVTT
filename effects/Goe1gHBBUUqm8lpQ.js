let roll = await this.script.roll("2d6");
this.actor.applyHealing({toughness: roll});