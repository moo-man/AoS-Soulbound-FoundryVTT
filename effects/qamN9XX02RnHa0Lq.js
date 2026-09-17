if (args.test?.context.flags.boingSmash)
{
    args.damage *= 2;
    this.script.notification("Damage doubled");
    args.actor.addCondition("prone");
}