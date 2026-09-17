await this.actor.applyHealing({toughness: this.effect.sourceTest.result.toughness});

if (this.actor.system.combat.health.toughness.value == this.actor.system.combat.health.toughness.max)
{
  this.script.notification("Toughness at max, removing all Conditions")
  this.actor.deleteEmbeddedDocuments("ActiveEffect", this.actor.effects.contents.filter(e => e.isCondition).map(i => i.id));
}