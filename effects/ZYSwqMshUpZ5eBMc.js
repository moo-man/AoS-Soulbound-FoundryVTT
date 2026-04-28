if (args.actor.hasCondition("frightened"))
{
  args.damage += args.test.result.triggers;
  this.script.notification(`Added ${args.test.result.triggers} extra damage`)
}