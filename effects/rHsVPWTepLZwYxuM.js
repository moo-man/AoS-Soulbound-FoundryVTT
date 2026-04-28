let conditions = this.actor.effects.contents.filter(e => e.isCondition);

let choice = await ItemDialog.create(conditions, 1, {text: "Select Condition to remove", title : this.effect.name})

if (choice[0])
{
  choice[0].delete();
  this.actor.spend("system.combat.mettle.value");
}