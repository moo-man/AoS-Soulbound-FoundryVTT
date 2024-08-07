let realmstone = await ItemDialog.create(Object.values(game.aos.config.realmstone), 1, {title : "Realmstone"})

if (realmstone[0])
{
	this.effect.updateSource({name : this.effect.name + ` (${realmstone[0].name})`, "flags.age-of-sigmar-soulbound.realmstone" : realmstone[0].statuses[0]})
	this.item.updateSource({name : this.item.name + ` (${realmstone[0].name})`})
}