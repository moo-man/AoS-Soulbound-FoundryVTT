if (this.actor.uuid != this.effect.sourceActor.uuid)
{ 
  this.actor.applyDamage(3, {ignoreArmour: true, hazard: true});
}