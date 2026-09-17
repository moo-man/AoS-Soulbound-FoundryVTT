if (this.effect.disabled && this.actor.enemiesInZone.length >= 2 )
{
  if (await this.script.dialog(`Activate ${this.effect.name}? (2 or more enemies within Close Range)`))
  {
    this.effect.update({"disabled" : false});
  }
}
else if (!this.effect.disabled && this.actor.enemiesInZone.length < 2)
{
  this.effect.update({"disabled" : true});
  this.script.notification("Disabled");
}