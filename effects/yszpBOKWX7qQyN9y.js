if (args.remaining < 0 && this.actor.sharesZoneWith(args.test?.actor))
{
  this.actor.setupAbilityUse(this.item);
}