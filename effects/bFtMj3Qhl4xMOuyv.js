let toughness = this.actor.system.combat.health.toughness;
let body = this.actor.system.attributes.body.value
let diff = toughness.max - toughness.value 
if (diff > 0)
{
    this.actor.update({"system.combat.health.toughness.value" : toughness.value + body})
    this.script.message(`Healed ${Math.min(diff, body)} Toughness.`)
    
}