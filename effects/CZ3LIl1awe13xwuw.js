let name = await ValueDialog.create({text: "Enter Soul Stored", title: this.effect.name});

this.item.update({name: this.item.setSpecifier(name)});

this.script.message(`Stored soul of ${name}`);