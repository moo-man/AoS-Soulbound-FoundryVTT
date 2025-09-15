let actor = await DragDialog.create({ text: "Provide Actor for Loyal Companion", title: this.effect.name, filter: (actor) => actor.documentName == "Actor", onError: "Must provide an Actor" })

if (!actor.prototypeToken.actorLink)
{
    ui.notifications.warn("It is recommended that your companion is linked to their Actor (Link Actor Data checked)", {permanent: true})
}
await this.effect.setFlag(game.system.id, "companion", actor.uuid);
let effectData = this.item.effects.contents[1].convertToApplied();
effectData.name += ` (${this.actor.name})`
actor.applyEffect({effectData})
await this.effect.update({name : this.effect.baseName + ` (${actor.name})`})
await this.item.update({name : this.item.baseName + ` (${actor.name})`})