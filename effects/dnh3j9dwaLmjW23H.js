let reforged = await new Roll("1d6x6").roll();

reforged.toMessage(this.script.getChatData());

this.effect.update({name: this.effect.setSpecifier(reforged.total)})