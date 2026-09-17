if (this.actor.statuses.has("light"))
{
  this.actor.applyHealing({toughness: Math.ceil(this.actor.system.attributes.body.value / 2)});
}
else 
{  
    this.actor.applyHealing({toughness: 1});
}