if (args.test?.actor && !args.actor.actorsInZone.find(e => e.uuid == args.test.actor.uuid) && args.test.item?.system.isRanged)
{
    this.actor.setupAbilityUse(this.item);
}