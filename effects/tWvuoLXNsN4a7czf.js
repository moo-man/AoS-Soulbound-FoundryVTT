let effects = ["WT9yos0UqLrRxXY3", "EI2PkYsX9NtwqDZP", "49ahAJ6fm0N1KSLk", "F8tSc0zjZZI9L1vk"].map(id => this.item.effects.get(id));

let choice = await ItemDialog.create(effects, 1, {text: "Choose Aspect", title: this.effect.name})


if (choice[0])
{
    for(let effect of effects)
    {
        if (effect.id == choice[0]?.id)
        {
            await effect.update({"system.transferData.type" : "document"});
        }
        else 
        {
            await effect.update({"system.transferData.type" : "other"});
        }
    }

    this.item.update({name: this.item.setSpecifier(choice[0].name)});
}