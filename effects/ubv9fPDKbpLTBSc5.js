if (this.actor.uuid != this.effect.sourceActor.uuid)
{ 
  this.actor.applyDamage(1, {hazard: true});
}