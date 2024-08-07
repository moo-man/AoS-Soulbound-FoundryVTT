let target = Array.from(game.user.targets)[0];

if (target?.actor)
{
    if (target.actor.isToken)
    {
        ui.notifications.warn("It is recommended that your companion is linked to their Actor (Link Actor Data checked)", {permanent: true})
    }
    await this.effect.setFlag(game.system.id, "companion", target.actor.uuid);
    let effectData = this.item.effects.contents[1].convertToApplied();
    effectData.name += ` (${this.actor.name})`
    target.actor.applyEffect({effectData})
    await this.effect.update({name : this.effect.baseName + ` (${target?.actor.name})`})
    await this.item.update({name : this.item.baseName + ` (${target?.actor.name})`})
}
else
{
    ui.notifications.notify("Must target a Token")
}