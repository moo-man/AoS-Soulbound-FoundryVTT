let test = await this.actor.system.setupCombatTest(this.item, {flags: {counter: true}});

if (test)
{
  this.script.notification("Spent 1 Mettle")
  this.actor.spend("system.combat.mettle.value");
}