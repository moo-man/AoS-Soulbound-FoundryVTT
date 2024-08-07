let itemSpecifier = this.item.specifier;

if (itemSpecifier)
{
    this.effect.updateSource({name : this.effect.baseName + ` (${itemSpecifier})`})
    return;
}

if (!itemSpecifier)
{
    let choice = await ItemDialog.create(ItemDialog.objectToArray({
        desert: "Desert",
        forest: "Forest",
        grassland: "Grassland",
        mountain: "Mountain",
        tainted: "Tainted Lands",
        tundra: "Tundra",
    }, this.item.img), 1, { title: this.effect.name, text: "Choose Sense" });

    let specifier = choice[0]?.name;
    if (specifier)
    {
        this.effect.updateSource({name : this.effect.baseName + ` (${specifier})`})
        this.item.updateSource({name : this.item.baseName + ` (${specifier})`})
    }
}