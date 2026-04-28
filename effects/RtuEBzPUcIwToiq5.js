let allSpells = await warhammer.utility.findAllItems("spell", "Loading Miracles", true, ["system.lore"]);

let lightOrBright = allSpells.filter(i => ["Light", "Bright"].includes(i.system.lore));

if (lightOrBright.length)
{
    let choice = await ItemDialog.create(lightOrBright, 1, {title : this.effect.name, text : "Choose Spell"})
    if (choice[0])
    {
        this.actor.addEffectItems(choice[0].uuid, this.effect, {"system.skill" : "devotion", "system.attribute" : "soul"});
    }
}