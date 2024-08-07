let combatant = game.combat.turns.find(i => i.actor?.uuid == this.actor.uuid)
combatant.update({"flags.age-of-sigmar-soulbound.initiative" : combatant.initiative, initiative : 0}).then(() => {
    this.actor._initialize();
    this.actor.sheet.render(true);
})