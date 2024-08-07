let skill = await ItemDialog.create(ItemDialog.objectToArray({arcana : "Arcana", lore : "Lore", theology : "Theology"}, this.item.img), 1, {title : this.effect.name, text : "Choose Skill"})

if (skill[0])
{
    this.effect.updateSource({name : this.effect.baseName + ` (${skill[0].name})`, [`flags.${game.system.id}.forbiddenKnowledge`] : skill[0].id});
    this.item.updateSource({name : this.item.baseName + ` (${skill[0].name})`});
}