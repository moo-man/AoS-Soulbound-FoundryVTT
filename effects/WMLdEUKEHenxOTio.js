let name = await ValueDialog.create({text: "Enter Name", title: this.effect.name});
let skill = await ValueDialog.create({text : "Choose Skill", title : this.effect.name}, "", game.aos.config.skills)

if (name && skill)
{
  await this.effect.updateSource({[`flags.${game.system.id}.bigNameSkill`] : skill, name: this.effect.setSpecifier(game.aos.config.skills[skill])});
  this.item.updateSource({name: this.item.setSpecifier(`${name} — ${game.aos.config.skills[skill]}`)});
}