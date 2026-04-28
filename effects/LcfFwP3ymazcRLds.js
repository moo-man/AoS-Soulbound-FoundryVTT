let conditions = ["charmed", "frightened"];

if (args.type == "effect" && args.options.action == "create" && conditions.some(i => args.document.statuses.has(i)))
{
  this.script.notification("Immune to " + args.document.name);
  return false;
}