args.context.flags.wurrgog = true;
this.actor.update(this.actor.system.combat.addWound("minor")).then(a => {
  if (a.system.combat.health.wounds.mortal)
  {
    a.addCondition("dead");
  }
})