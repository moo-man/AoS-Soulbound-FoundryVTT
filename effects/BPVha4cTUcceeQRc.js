if (args.type == "item" && args.options.action == "update" && args.data.system?.equipped && args.document.type == "armour")
{
  this.script.notification("Cannot wear Armour!", "error")
  return false;
}