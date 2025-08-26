let roll = await new Roll("1d6").roll();

roll.toMessage(this.script.getChatData());

this.actor.applyHealing({toughness : roll.total});