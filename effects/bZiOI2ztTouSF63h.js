let charge = await ValueDialog.create({text: "Name Your Charge", title: this.effect.name});

if (charge)
{
  this.item.update({name: this.item.setSpecifier(charge)});
}