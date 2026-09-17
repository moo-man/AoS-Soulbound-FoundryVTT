if (args.target.type == "player" || (args.target.type == "npc" && args.target.system.bio.type != 1))
{
  this.actor.setupAbilityUse(this.item);
}