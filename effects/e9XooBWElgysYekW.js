if (args.tags.includes("fire") || args.tags.includes("bright"))
{
  this.script.notification("Immune")
  args.abort = true;
}