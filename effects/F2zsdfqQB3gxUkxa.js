let traits = {
    crushing : "Crushing",
    piercing : "Piercing",
    slashing : "Slashing",
}

let chosen = await ItemDialog.create(ItemDialog.objectToArray(traits, this.item.img), 1, {title : this.effect.name, text: "Select Trait"})

if (chosen[0])
{
    let newTraits = this.item.system.traits.filter(i => !["crushing", "piercing", "slashing"].includes(i.name));
    newTraits.push({name : chosen[0].id})
    await this.item.update({"system.traits" : newTraits})
    this.script.message(`Changed to <strong>${chosen[0].name}</strong>`, {flavor : this.item.name})
}