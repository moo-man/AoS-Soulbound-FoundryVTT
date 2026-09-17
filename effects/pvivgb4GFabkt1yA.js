let name = await ValueDialog.create({text: "Name Enemy", title: this.effect.baseName});

let zoneEffect = this.item.effects.get("BCSMTZ293y1oPaJK");
if (name)
{
  zoneEffect?.update({name: zoneEffect.setSpecifier(name)})
  this.effect.update({name: this.effect.setSpecifier(name)})
  ChatMessage.create(ChatMessage.applyMode({content: `We'll get ${name} next time!`, flavor: this.effect.baseName, speaker: this.actor.speakerData(this.actor.getActiveTokens()[0]?.document)}, "ic"));
}
else if (name == "")
{
  zoneEffect?.update({name: zoneEffect.baseName})
  this.effect.update({name: this.effect.baseName})
}