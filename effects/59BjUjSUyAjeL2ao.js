this.script.message("Drank from the Bloodseeker Chalice");
this.item.update({name: this.item.baseName});
this.actor.update({"system.combat.mettle.value" : this.actor.system.combat.mettle.max})