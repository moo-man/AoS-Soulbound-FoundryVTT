let item = await DragDialog.create({text: "Gain a Talent that you meet the requirements for.", title: this.effect.name, filter: (item) => item.type == "talent", onError: "Must provide a Talent"});

if (item)
{
  let created = await this.actor.addEffectItems(item.uuid, this.effect);
  this.effect.update({name: this.effect.setSpecifier(created[0].name)})
}