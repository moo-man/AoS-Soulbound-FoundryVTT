if (args.spell || args.weapon?.system.isRanged)
{
  args.abort = true;
  this.script.notification("Cannot cast Spells or make Ranged Attacks!", "error");
}
return true;