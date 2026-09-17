if (args.test?.testData.charging)
{
    await args.actor.addCondition("prone");
    await args.actor.addCondition("stunned");
}