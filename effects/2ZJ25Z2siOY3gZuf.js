let test = await this.effect.sourceItem?.system.test.roll(this.actor, {appendTitle : ` - ${this.effect.name}`})
if(test.failed)
{
    this.actor.applyDamage(10, {ignoreArmour : true});
}
else 
{
    this.actor.addCondition("prone");
}