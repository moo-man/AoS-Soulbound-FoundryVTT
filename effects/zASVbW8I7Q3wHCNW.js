let effect = await this.script.chooseEffect();
if (effect)
{
  effect.update({"system.transferData.type" : "document"});
  this.item.update({name: this.item.setSpecifier(effect.name)})
  this.effect.update({"system.transferData.type" : "other"});
}