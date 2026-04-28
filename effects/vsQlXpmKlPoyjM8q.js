let traits = [this.actor.items.get("ip5lFfCfsqPVqIup"), this.actor.items.get("TpEeElKG4K5cNoEo"), this.actor.items.get("dhej6feXzksMECyB")];

let choice = await ItemDialog.create(traits, 1, {text: "Select Trait", title: this.effect.name})

if (choice[0])
{
  choice[0].effects.contents[0].update({disabled: false})
  args.update?.({name: choice[0].name});
  this.actor.update({name: choice[0].name, "prototypeToken.name" : choice[0].name})
}