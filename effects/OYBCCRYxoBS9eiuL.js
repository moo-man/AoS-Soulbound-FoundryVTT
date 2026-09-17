if (this.actor.uuid != this.effect.sourceActor.uuid)
{ 
  this.actor.applyDamage(this.effect.sourceTest.result.fireDamage || 1, {ignoreArmour: true});
}