let effects = this.item.effects.filter(e => e.system.transferData.type == "other");

let chosen = await ItemDialog.create(effects, 1, {title: this.effect.name, text: "Choose Effect"})

if (!chosen.length)
  return;

if (await this.actor.spend("system.combat.mettle.value"))
{
  this.script.notification("Spent 1 Mettle");
}
else
{
   this.script.notification("Not enough Mettle!", "error");
  return;
}

let existing = this.actor.effects.contents.filter(e => e.sourceItem?.uuid == this.item.uuid)

if (existing.length)
{ 
    await this.actor.deleteEmbeddedDocuments("ActiveEffect", existing.map(i => i.id));
}

this.actor.applyEffect({effects: chosen});