if (args.actor.system.combat.health.toughness.value < args.actor.system.combat.health.toughness.max)
{
    args.fields.bonusDice += 2;
}
if (args.actor.system.combat.health.wounds.value)
{
    args.fields.bonusDice += 2;
}