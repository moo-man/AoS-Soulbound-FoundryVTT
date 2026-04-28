await this.actor.update({"system.combat.speeds.flight" : "normal"});

this.actor.addEffectItems("Compendium.soulbound-core.items.Item.nop4Bja1CoY2s2dO", this.effect, {name: "Talons", img: this.effect.img, system: {
  damage : "1 + S", equipped: true, traits: [{name: "penetrating"}, {name: "piercing"}]
}})