if (await this.effect.resistEffect())
{
  this.actor.applyEffect({effects: this.effect.sourceItem.effects.get("F5UOqWuJgFVUuOIM")})
}
else 
{
  this.actor.addCondition("poisoned");
}