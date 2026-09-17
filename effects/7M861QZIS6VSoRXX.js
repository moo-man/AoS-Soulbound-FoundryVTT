let target = args.targets[0]

if (target)
{
   return !!(target.actor.hasCondition("incapacitated") ||
          target.actor.hasCondition("prone") ||
          target.actor.hasCondition("restrained"))
}