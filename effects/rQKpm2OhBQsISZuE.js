let focus = await ValueDialog.create({text : "Enter Scholarly Focus", title : this.effect.name}, "");
this.effect.updateSource({name : this.effect.baseName + ` (${focus})`});
this.item.updateSource({name : this.item.baseName + ` (${focus})`});