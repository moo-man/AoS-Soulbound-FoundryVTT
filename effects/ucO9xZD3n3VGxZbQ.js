args.ignoreArmour = false;

if (!args.actor.hasCondition("poisoned"))
{
  args.abort = "Not Poisoned!";
}