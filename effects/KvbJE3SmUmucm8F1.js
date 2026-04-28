let choice = await ItemDialog.create(ItemDialog.objectToArray({1: "Warrior", 2: "Champion", 3: "Chosen"}), 1, {text: "Select Type", title: this.effect.name});

if (choice[0])
{
  this.effect.updateSource({"system.changes" : [{key: "system.combat.armour.bonus", mode: 2, value: choice[0].id}], name: this.effect.setSpecifier(choice[0].name)});
}