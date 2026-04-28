if (this.actor.system.combat.mettle.value)
{
  if (await this.script.dialog("Spend Mettle to teleport within Long Range?"))
  {
    this.actor.spend("system.combat.mettle.value");
    this.script.message("Teleports!");
  }
}