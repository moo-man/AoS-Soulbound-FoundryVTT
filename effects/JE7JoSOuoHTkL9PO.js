let testFailed;
if ([3,4].includes(this.actor.system.bio.type))
{
    let test = await this.actor.system.setupCommonTest({skill : "determination"}, {fields : {difficulty : 6, complexity : 3}, appendTitle : ` - ${this.effect.name}`})
    testFailed = test.failed;
}
else 
{
    testFailed = true;
}

if (testFailed)
{
    await this.actor.update({"system.combat.health.toughness.value" : 0});
    this.actor.addCondition("dead");
}
else 
{
    
    await this.actor.applyDamage(10);
    await this.actor.addCondition("stunned")
}