if (this.actor.hasCondition("poisoned"))
{
  this.actor.applyDamage(3)
}
else 
{
   this.actor.addCondition("poisoned"); 
}