if (args.test.testData.context.unmakingStrike)
{
    args.abort = "Unmaking Strike applied";
    this.script.message(`One item or piece of armour destroyed on <strong>${args.actor.name}</strong>`)
}