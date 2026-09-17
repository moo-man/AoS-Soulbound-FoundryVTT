if (await this.script.dialog("Immune to damage from cold or ice. Ignore incoming damage?"))
{
  args.abort = true;
  this.script.message("Ignored Damage");
}