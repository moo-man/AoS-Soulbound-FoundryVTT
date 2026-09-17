let choice = await ItemDialog.create(ItemDialog.objectToArray({"sneakin" : "Sneaking Tattooz", "both" : "Best o' Both Tattooz", "flashy" : "Flashy Tattooz"}, this.item.img), 1, {text: "Select Type", title: this.effect.name});

if (choice[0].id == "sneakin")
{
  this.item.updateSource({"system.benefit" : 1, "system.equipped" : true, name: choice[0].name});
}
else if (choice[0].id == "both")
{
  if (this.actor.system.attributes.soul.value < 2)
  {
    args.options.abortItemCreation = true;
    this.script.notification("Need Soul (2)!", "error")
    return false;
  }
  this.item.updateSource({"system.benefit" : 2, "system.equipped" : true, name: choice[0].name});
}
else if (choice[0].id == "flashy")
{
    if (this.actor.system.attributes.soul.value < 4)
  {
    args.options.abortItemCreation = true;
    this.script.notification("Need Soul (4)!", "error")
    return false;
  }
  this.item.updateSource({"system.benefit" : 3, "system.equipped" : true, name: choice[0].name});
}