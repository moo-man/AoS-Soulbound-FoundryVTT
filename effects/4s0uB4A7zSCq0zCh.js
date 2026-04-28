let choice = (await ItemDialog.create(ItemDialog.objectToArray({"weaponSkill" : "Weapon Skill", "ballisticSkill": "Ballistic Skill"}), 1, {text: "Select Bonus", title: this.effect.name}))[0]

if (!choice)
{
  choice = {id: "weaponSkill", name : "Weapon Skill"};
}

this.effect.updateSource({[`flags.${game.system.id}.skill`] : choice.id, name : this.effect.setSpecifier(choice.name)});