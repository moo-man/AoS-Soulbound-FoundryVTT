let applied = await this.actor.applyDamage(3, {hazard: true});

if (applied.damage)
{
  this.actor.addCondition("restrained");
}