let roll = await new Roll("2d6").roll();
let currentZone = [...this.actor.getActiveTokens()[0].document.regions][0]
roll.toMessage(this.script.getChatData())

let effectData = this.item.effects.contents[1].toObject();
effectData.flags.roll = roll.total;
effectData.system.transferData.type == "zone";
effectData.system.zone.type == "tokens";

if (currentZone)
{
    ZoneHelpers.applyEffectToZone({effectData}, currentZone, null)
}