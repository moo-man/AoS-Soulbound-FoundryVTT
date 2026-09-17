let roll = await this.script.roll("1d6");

if (roll <= 2)
{
  await this.actor.update(this.actor.system.combat.addWound("serious"))
  this.script.message("Suffered a Serious Wound");
}