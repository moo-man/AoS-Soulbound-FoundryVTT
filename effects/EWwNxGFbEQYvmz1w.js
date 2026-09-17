if (args.spell?.id == this.effect.getFlag(game.system.id, "spell"))
{
  this.script.notification(`Cannot cast ${args.spell.name}!`, "error");
  args.abort = true;
}
return true;