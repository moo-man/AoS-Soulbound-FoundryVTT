if (args.testData.context.backstab && args.succeeded)
{
    if (args.result.damage)
    {
        args.result.damage.total *= 2;
    }
    if (args.result.primary?.damage)
    {
        args.result.primary.damage.total *= 2;
    }
    if (args.result.secondary?.damage)
    {
        args.result.secondary.damage.total *= 2;
    }
    args.result.other.push({label : this.effect.name, description : "Damage Doubled, Ignores AP"})
}