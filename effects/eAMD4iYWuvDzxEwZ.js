let target = Array.from(game.user.targets)[0];

if (!target || target.actor.uuid == this.actor.uuid)
{
  this.script.notification("No Targets!", "error");
}

if (target.actor)
{
  this.actor.applyHealing({toughness: target.actor.system.attributes.body.value});
  this.script.message(`Devoured <strong>${target.actor.name}</strong>`);
}
else 
{
  this.script.notification("Target not associated with an Actor!", "error");
}