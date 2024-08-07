let choice = await ItemDialog.create(this.item.effects.contents.slice(0, 3), 1, {title : this.item.name, text : "Choose Active Bonus"})

this.item.setFlag(game.system.id, "active", choice[0]?.id)