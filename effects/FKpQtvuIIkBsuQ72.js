let duty = await ValueDialog.create({text: "Choose Duty", title: this.effect.name});

if (duty)
{
  this.item.updateSource({name: this.item.setSpecifier(duty)});
}