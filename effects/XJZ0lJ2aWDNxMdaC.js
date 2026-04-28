if (args.type == "data")
{
  let wounds = foundry.utils.getProperty(args.data, "system.combat.wounds");
  let toughness = foundry.utils.getProperty(args.data, "system.combat.health.toughness.value");

  if (wounds?.length < this.actor.system.combat.wounds.length || toughness > this.actor.system.combat.health.toughness.value)
  {
    this.script.notification("Cannot Heal!");
    this.actor.sheet?.render({force: true}); // Rerender so toughness value gets reset from the user entered value
    return false;
  }
}