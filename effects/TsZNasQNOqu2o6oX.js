if (args.damage > 0 && args.test?.weapon?.system.isMelee && this.actor.inCombat)
{
    this.script.notification("Melee increased by 1");
    let changes = this.effect.changes.map(c => {
        c.value = (Number(c.value) + 1);
        return c;
    });
    this.effect.update({changes})
}