let actor = await DragDialog.create({ text: "Provide Actor for Lifeless Companion", title: this.effect.name, filter: (actor) => actor.documentName == "Actor", onError: "Must provide an Actor" })

if (!actor.prototypeToken.actorLink)
{
    ui.notifications.warn("It is recommended that your companion is linked to their Actor (Link Actor Data checked)", {permanent: true})
}
await this.effect.setFlag(game.system.id, "companion", actor.uuid);
let companion = this.item.effects.get("8z64QNT02hgNhbEp").convertToApplied();
let lifeless = this.item.effects.get("XbISOdaswQ3dx3cp").convertToApplied();
companion.name += ` (${this.actor.name})`
actor.applyEffect({effectData: [companion, lifeless]})
await this.effect.update({name : this.effect.setSpecifier(actor.name)})
await this.item.update({name : this.item.setSpecifier(actor.name)})