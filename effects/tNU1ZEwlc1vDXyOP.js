let traits = {close : "Close",
defensive : "Defensive",
restraining : "Restraining",
reach : "Reach",
spread : "Spread",
penetrating : "Penetrating"}

// Remove already existing traits
for(let trait of this.item.system.traits)
{
    delete traits[trait]
}

let chosen = await ItemDialog.create(ItemDialog.objectToArray(traits, this.item.img), 1, {title : this.effect.name})

if (chosen[0])
{
    let previous = this.effect.getFlag("age-of-sigmar-soulbound", "chamoniteTrait");
    let newTraits = this.item.system.traits.filter(i => i.name != previous);
    newTraits.push({name : chosen[0].id})
    this.effect.setFlag("age-of-sigmar-soulbound", "chamoniteTrait", chosen[0].id);
    await this.item.update({"system.traits" : newTraits})
    if (previous)
    {
        this.script.message(`Changed from <strong>${game.aos.config.traits[previous]}</strong> to <strong>${game.aos.config.traits[chosen[0].id]}</strong>`, {flavor : this.item.name})
    }
}