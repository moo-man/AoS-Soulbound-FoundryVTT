if (args.type == "effect" && args.options.action == "create" && ["minor"].some(i => args.document.statuses.has(i)))
{
  if (await this.script.confirm("Ignore Minor Hazard?"))
  { 
    this.script.notification("Immune to " + args.document.name);
    return false;
  }
}