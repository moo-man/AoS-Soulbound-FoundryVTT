let previousActor = args.combat.combatants.get(args.combat.previous.combatantId)?.actor;

if (previousActor && previousActor.hasCondition("frightened") && !previousActor.hasCondition("dead"))
{
  this.actor.applyHealing({toughness: 1})
}