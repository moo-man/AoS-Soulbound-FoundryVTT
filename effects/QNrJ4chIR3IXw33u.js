let duty = await ValueDialog.create({text: "Choose Duty", title: this.effect.name});

if (duty)
{
  this.item.update({name: this.item.setSpecifier(duty)});
}