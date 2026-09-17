if (this.actor.system.isSwarm)
{ 
  this.actor.applyDamage(15);
}
else 
{
  this.actor.applyDamage(5);
}
this.actor.addCondition("prone");