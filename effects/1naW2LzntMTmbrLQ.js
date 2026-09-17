let types = {
    "melee" : "+1 Armour against Melee Attacks", 
    "ranged" : "+1 Armour against Ranged Attacks",
    "spells" : "+1 Armour against Spells",
    "target" : "+1 Armour against Target"
}

let choice = await ItemDialog.create(ItemDialog.objectToArray(types, this.effect.img), 1, {title : this.effect.name});
if (choice[0].id == "target")
{
    let target = Array.from(game.user.targets)[0]?.actor;
    if (!target)
    {
        return this.script.notification("A target must be selected for this option", "error")
    }
    await this.effect.setFlag("age-of-sigmar-soulbound", "chamoniteDefenceTarget", target.uuid);
}
this.effect.setFlag("age-of-sigmar-soulbound", "chamoniteDefence", choice[0].id);
this.script.message(choice[0].name, {flavor : this.item.name})