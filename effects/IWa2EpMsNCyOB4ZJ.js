let successes = this.effect.sourceTest.result.successes;

let attributes = Object.values(this.actor.system.attributes).map(i => i.value);

let max = Math.max(...attributes);

if (max <= successes)
{
  this.actor.applyEffect({effects: this.effect.sourceItem.effects.get("jcKShx0UMpnX4wd0")})
  this.script.message(`Mortal Touch applied to ${this.actor.name}!`)
}
else 
{
  this.effect.sourceActor.applyEffect({effects: this.effect.sourceItem.effects.get("jcKShx0UMpnX4wd0")})
  this.script.message(`Mortal Touch applied to ${this.effect.sourceActor.name}!`)
  
}