if (args.damage > 0)
{
    let region = Array.from(this.actor.getActiveTokens()[0]?.document.regions)[0];
    
    if (region)
    {
        let effect = this.item.effects.contents[1].convertToApplied();
        effect.system.transferData.type = "zone";
        effect.system.zone.type = "tokens";
        ZoneHelpers.applyEffectToZone({effectData : [effect]}, region);
    }
}