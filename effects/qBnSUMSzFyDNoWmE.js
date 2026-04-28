let effects = ["u3JFNROP3pCFXblg", "kriDONzlEwyiwngS", "W7jBfVvWvYsrEMpx", "Y70TmUtt0JF0i1gJ"].map(id => this.item.effects.get(id));

let choice = await ItemDialog.create(effects, 1, {text: "Choose Effect", title: this.effect.name})

if (choice[0])
{
  choice[0].updateSource({"system.transferData.type" : "document"})
  await choice[0].handleImmediateScripts()
  this.item.updateSource({name: this.item.setSpecifier(choice[0].name)})
}