let damage = await ValueDialog.create({text: "Provide Damage (1 per 10 feet fallen)", title: this.effect.name}, Math.floor(this.actor.getActiveTokens()[0]?.document?.elevation / 10) || 0);
if (damage)
{ 
  this.actor.addCondition("prone");
  this.actor.applyDamage(damage);
  this.actor.getActiveTokens()[0]?.document.update({elevation: 0});
}