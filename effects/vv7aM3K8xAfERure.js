let species = await ValueDialog.create({text: "Set Hated Species", title: this.effect.name});

if (species)
{
  this.item.updateSource({name: this.item.setSpecifier(species)});
}