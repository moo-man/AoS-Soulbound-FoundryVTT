let roll = await new Roll("1d6").roll();
roll.toMessage(this.script.getChatData());

if (roll.total >= 4)
{
  this.actor.applyEffect({effects: this.item.effects.get("TJfF51ltyZvm4qWl")});
}