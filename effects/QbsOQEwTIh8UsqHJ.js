args.ignoreArmour = true;

if (args.actor.type != "player" && args.actor.system.bio.type < 3)
{
  args.abort = "Not a Champion or Chosen!"
}

if (args.actor.itemTypes.spell.length > 0)
{
  args.damage *= 2;
  this.script.notification("Doubled Damage against spellcaster")
}