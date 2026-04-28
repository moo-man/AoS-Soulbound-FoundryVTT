let wounds = this.actor.system.combat.wounds.map((wound, i) => {
  return {
    id: i,
    name: game.aos.config.woundType[wound.type]
  }
})

let choice = await ItemDialog.create(wounds, 1, {text: "Select Wound to heal", title: this.effect.sourceItem.name})

if (choice[0])
{
  this.actor.update({"system.combat.wounds" : this.actor.system.combat.wounds.filter((_, index) => index != choice[0].id)});
  this.script.message(`Healed ${choice[0].name}`)
}