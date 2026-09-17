if (args.type == "effect" && args.options.action == "create" && ["poisoned"].some(i => args.document.statuses.has(i)))
{
  this.actor.addCondition("stunned");
}