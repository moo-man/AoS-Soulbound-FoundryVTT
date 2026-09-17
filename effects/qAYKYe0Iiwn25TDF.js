args.ignoreArmour = true;

if (args.damage > args.actor.system.attributes.mind.value)
{
  args.abort = true;
  let dead = false;
  if (args.actor.system.combat.health.wounds.max == 0)
  {
    await args.actor.update({"system.combat.health.toughness.value": 0});
    dead = true;
  }
  else if (args.actor.system.combat.health.wounds.max > 0)
  {
    if (args.actor.system.combat.health.toughness.value == 0)
    {
      this.script.notification("Added Deadly Wound")
      await args.actor.update(args.actor.system.combat.addWound("deadly"));
      if (args.actor.system.combat.health.wounds.value >= args.actor.system.combat.health.wounds.max)
      {
        dead = true;
      }
    }
    else 
    { 
      this.script.notification("Reduced Toughness to 0")
      await args.actor.update({"system.combat.health.toughness.value": 0});
    }
  }
  if (dead)
  {
    this.script.notification(`Kills ${args.actor.name}`);
    await args.actor.addCondition("dead", {}, {overlay: true, tint: "#2bff00"})
  }
}