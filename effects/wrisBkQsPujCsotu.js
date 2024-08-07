let target = Array.from(game.user.targets)[0];

if (target?.actor)
{
    this.effect.setFlag(game.system.id, "target", target.actor.uuid);
    let effectData = this.item.effects.contents[1].convertToApplied();
    effectData.name += ` (${this.actor.name})`
    target.actor.applyEffect({effectData})
    this.script.notification(target.actor.name)
}
else
{
    ui.notifications.notify("Must target a Token")
}