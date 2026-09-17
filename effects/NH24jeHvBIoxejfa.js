if (args.test.weapon?.system.category == 'melee' && args.damage >= 1 && (args.actor.system.bio?.size ?? 2) <= 3)
{
  await args.actor.addCondition("prone");
}