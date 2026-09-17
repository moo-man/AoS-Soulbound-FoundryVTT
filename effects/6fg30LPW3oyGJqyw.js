if (args.type == "effect" && args.options.action == "create")
{
  if  (args.document.statuses.has("minor"))
  { 
    this.script.notification("Immune to " + args.document.name);
    return false;
  }
  else if (args.document.statuses.has("major"))
  {
    args.data = game.aos.config.systemEffects["minor"];
    args.document.updateSource(args.data);
  }
  else if (args.document.statuses.has("deadly"))
  {
        args.data = game.aos.config.systemEffects["major"];
      args.document.updateSource(args.data);
  }
}