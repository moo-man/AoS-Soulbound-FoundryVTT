if (!args.damage)
{
  return;
}

let test = await this.effect.sourceItem.system.test.roll(this.actor, {appendTitle : ` - ${this.effect.name}`});
if (test.failed)
{
    await this.actor.addCondition("stunned");
}